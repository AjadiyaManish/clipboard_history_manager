/** @odoo-module **/

import { Component, useState, onWillStart, onMounted } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";

class ClipboardSystray extends Component {
    setup() {
        this.orm = useService("orm");
        this.notification = useService("notification");

        this.state = useState({
            open: false,
            history: [],
            search: "",
            activeTab: "history", // history, bookmark, settings
            notificationsEnabled: true,
            clipboardEnabled: true,
        });

        onWillStart(async () => {
            await this.loadHistory();
            await this.loadSettings();
        });

        onMounted(() => {
            // Register this component globally for clipboard service updates
            if (window.clipboardHistoryService) {
                window.clipboardHistoryService.setComponent(this);
            }
        });
    }

    async loadHistory() {
        try {
            this.state.history = await this.orm.call(
                "clipboard.history",
                "get_clipboard_history",
                []
            );
        } catch (error) {
            console.error("Failed to load clipboard history:", error);
            // Always show error on load
            this.notification.add("Failed to load clipboard history", {
                type: "danger",
            });
        }
    }

     async loadSettings() {
         try {
             const settings = await this.orm.call(
                 "clipboard.settings",
                 "get_user_settings",
                 []
             );
             this.state.notificationsEnabled = settings.notifications_enabled;
             this.state.clipboardEnabled = settings.clipboard_enabled;
         } catch (error) {
             console.error("Failed to load settings:", error);
             this.state.notificationsEnabled = true;
             this.state.clipboardEnabled = true;
         }
     }

    toggleSidebar() {
        this.state.open = !this.state.open;
    }

    switchTab(tabName) {
        this.state.activeTab = tabName;
        // Clear search when switching tabs
        this.state.search = "";
    }

    clearSearch() {
        this.state.search = "";
    }

    showNotification(message, type = "success") {
        // Only show notification if enabled
        if (this.state.notificationsEnabled) {
            this.notification.add(message, {
                type: type,
            });
        }
    }

     async toggleNotifications(event) {
         try {
             // If called with an event from checkbox, use the new state from the input
             const newState = event ? event.target.checked : !this.state.notificationsEnabled;

             const enabled = await this.orm.call(
                 "clipboard.settings",
                 "set_notifications",
                 [newState]
             );
             this.state.notificationsEnabled = enabled;
             const message = enabled ? "Notifications enabled" : "Notifications disabled";
             // Always show the toggle confirmation message (for user awareness)
             this.notification.add(message, {
                 type: "success",
             });
         } catch (error) {
             console.error("Toggle notifications failed:", error);
             // Revert the UI state on error
             this.state.notificationsEnabled = !this.state.notificationsEnabled;
             // Always show error for settings failure (critical system message)
             this.notification.add("Failed to update notification settings", {
                 type: "danger",
             });
         }
     }

     async toggleClipboardEnabled(event) {
         try {
             // If called with an event from checkbox, use the new state from the input
             const newState = event ? event.target.checked : !this.state.clipboardEnabled;

             const enabled = await this.orm.call(
                 "clipboard.settings",
                 "set_clipboard_enabled",
                 [newState]
             );
             this.state.clipboardEnabled = enabled;
             const message = enabled ? "Clipboard manager enabled" : "Clipboard manager disabled";
             // Always show the toggle confirmation message (for user awareness)
             this.notification.add(message, {
                 type: "success",
             });
         } catch (error) {
             console.error("Toggle clipboard enabled failed:", error);
             // Revert the UI state on error
             this.state.clipboardEnabled = !this.state.clipboardEnabled;
             // Always show error for settings failure (critical system message)
             this.notification.add("Failed to update clipboard settings", {
                 type: "danger",
             });
         }
     }

     async copyAgain(text) {
         try {
             await navigator.clipboard.writeText(text);
             this.showNotification("Copied to clipboard", "success");
             // Close the sidebar after copying
             this.state.open = false;
         } catch (error) {
             console.error("Copy failed:", error);
             this.showNotification("Failed to copy", "danger");
         }
     }

    async toggleBookmark(item) {
        try {
            const isBookmarked = await this.orm.call(
                "clipboard.history",
                "toggle_bookmark",
                [item.id]
            );

            // Update the item in state
            item.is_bookmarked = isBookmarked;

            const message = isBookmarked ? "Added to bookmarks" : "Removed from bookmarks";
            this.showNotification(message, "success");
        } catch (error) {
            console.error("Toggle bookmark failed:", error);
            this.showNotification("Failed to update bookmark", "danger");
        }
    }

    async deleteItem(item) {
        try {
            const success = await this.orm.call(
                "clipboard.history",
                "delete_item",
                [item.id]
            );

            if (success) {
                // Remove the item from the list
                const index = this.state.history.findIndex(h => h.id === item.id);
                if (index > -1) {
                    this.state.history.splice(index, 1);
                }

                this.showNotification("Item deleted", "success");
            }
        } catch (error) {
            console.error("Delete item failed:", error);
            this.showNotification("Failed to delete item", "danger");
        }
    }

    async clearAll() {
        if (!confirm("Are you sure you want to clear all clipboard history?")) {
            return;
        }

        try {
            await this.orm.call(
                "clipboard.history",
                "clear_history",
                []
            );

            this.state.history = [];
            this.showNotification("Clipboard history cleared", "success");
        } catch (error) {
            console.error("Clear history failed:", error);
            this.showNotification("Failed to clear history", "danger");
        }
    }

    get filteredHistory() {
        let filtered = this.state.history;

        // Filter by active tab
        if (this.state.activeTab === "bookmark") {
            filtered = filtered.filter((item) => item.is_bookmarked);
        }

        // Filter by search
        if (!this.state.search) {
            return filtered;
        }

        return filtered.filter((item) =>
            item.copied_text
                .toLowerCase()
                .includes(this.state.search.toLowerCase())
        );
    }
}

ClipboardSystray.template = "clipboard_history_manager.ClipboardSystray";

registry.category("systray").add("clipboard_history_manager", {
    Component: ClipboardSystray,
});
