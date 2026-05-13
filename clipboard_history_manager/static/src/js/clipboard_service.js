/** @odoo-module **/

import { registry } from "@web/core/registry";

const serviceRegistry = registry.category("services");

let clipboardHistoryComponent = null;

const clipboardService = {
    start(env) {
        // Register global reference to update component history
        window.clipboardHistoryService = {
            setComponent(component) {
                clipboardHistoryComponent = component;
            },
            updateHistory(newItem) {
                if (clipboardHistoryComponent) {
                    clipboardHistoryComponent.state.history.unshift(newItem);
                }
            }
        };

        document.addEventListener("copy", async () => {
            try {
                const text = window.getSelection().toString();

                if (!text || text.trim() === "") {
                    return;
                }

                // Check if clipboard is enabled
                if (clipboardHistoryComponent && !clipboardHistoryComponent.state.clipboardEnabled) {
                    return;
                }

                const result = await env.services.orm.call(
                    "clipboard.history",
                    "save_clipboard_history",
                    [{
                        copied_text: text,
                        source_model: "Unknown",
                        source_url: window.location.href,
                    }]
                );

                // Reload history in the clipboard component if it's open
                if (clipboardHistoryComponent) {
                    await clipboardHistoryComponent.loadHistory();

                    // Show notification only if enabled
                    if (clipboardHistoryComponent.state.notificationsEnabled) {
                        env.services.notification.add(
                            "Text copied to clipboard history",
                            {
                                type: "success",
                            }
                        );
                    }
                } else {
                    // Show notification if component not loaded yet
                    env.services.notification.add(
                        "Text copied to clipboard history",
                        {
                            type: "success",
                        }
                    );
                }
            } catch (error) {
                console.error("Clipboard save failed", error);
            }
        });
    },
};

serviceRegistry.add("clipboard_history_service", clipboardService);
