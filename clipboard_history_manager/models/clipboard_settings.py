from odoo import api, fields, models


class ClipboardSettings(models.Model):
    _name = 'clipboard.settings'
    _description = 'Clipboard Manager Settings'

    user_id = fields.Many2one('res.users', required=True, unique=True, ondelete='cascade')
    notifications_enabled = fields.Boolean(default=True, help='Enable/disable clipboard notifications')
    clipboard_enabled = fields.Boolean(default=True, help='Enable/disable clipboard history capture')

    @api.model
    def get_user_settings(self):
        """Get settings for current user, create if not exists"""
        settings = self.search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)

        if not settings:
            settings = self.create({
                'user_id': self.env.user.id,
                'notifications_enabled': True,
                'clipboard_enabled': True,
            })

        return {
            'notifications_enabled': settings.notifications_enabled,
            'clipboard_enabled': settings.clipboard_enabled,
        }

    @api.model
    def toggle_notifications(self):
        """Toggle notifications for current user"""
        settings = self.search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)

        if not settings:
            settings = self.create({
                'user_id': self.env.user.id,
                'notifications_enabled': False,
            })
        else:
            settings.notifications_enabled = not settings.notifications_enabled

        return settings.notifications_enabled

    @api.model
    def set_notifications(self, enabled):
        """Set notifications enabled/disabled for current user"""
        settings = self.search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)

        if not settings:
            settings = self.create({
                'user_id': self.env.user.id,
                'notifications_enabled': enabled,
            })
        else:
            settings.notifications_enabled = enabled

        return settings.notifications_enabled

    @api.model
    def set_clipboard_enabled(self, enabled):
        """Set clipboard capture enabled/disabled for current user"""
        settings = self.search([
            ('user_id', '=', self.env.user.id)
        ], limit=1)

        if not settings:
            settings = self.create({
                'user_id': self.env.user.id,
                'clipboard_enabled': enabled,
            })
        else:
            settings.clipboard_enabled = enabled

        return settings.clipboard_enabled

