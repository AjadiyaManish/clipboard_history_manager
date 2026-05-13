from odoo import api, fields, models


class ClipboardHistory(models.Model):
    _name = 'clipboard.history'
    _description = 'Clipboard History'
    _order = 'copy_count desc, copied_datetime desc'

    user_id = fields.Many2one('res.users', required=True)
    copied_text = fields.Text(required=True)
    source_model = fields.Char()
    source_url = fields.Char()
    copied_datetime = fields.Datetime(default=fields.Datetime.now)
    copy_count = fields.Integer(default=1, help='Number of times this text has been copied')
    is_bookmarked = fields.Boolean(default=False, help='Mark as favorite/bookmark')

    @api.model
    def save_clipboard_history(self, values):
        # Check if this text already exists for the current user
        existing = self.search([
            ('user_id', '=', self.env.user.id),
            ('copied_text', '=', values.get('copied_text'))
        ], limit=1)

        if existing:
            # Update existing record: increment count and update timestamp
            existing.write({
                'copy_count': existing.copy_count + 1,
                'copied_datetime': fields.Datetime.now(),
            })
            history_id = existing.id
        else:
            # Create new record
            history = self.create({
                'user_id': self.env.user.id,
                'copied_text': values.get('copied_text'),
                'source_model': values.get('source_model'),
                'source_url': values.get('source_url'),
                'copy_count': 1,
            })
            history_id = history.id

        # Keep only top 100 records per user
        records = self.search([
            ('user_id', '=', self.env.user.id)
        ], order='copy_count desc, copied_datetime desc')

        if len(records) > 100:
            records[100:].unlink()

        return history_id

    @api.model
    def get_clipboard_history(self):
        records = self.search([
            ('user_id', '=', self.env.user.id)
        ], order='copy_count desc, copied_datetime desc', limit=100)

        return records.read([
            'copied_text',
            'source_model',
            'source_url',
            'copied_datetime',
            'copy_count',
            'is_bookmarked'
        ])

    @api.model
    def toggle_bookmark(self, history_id):
        record = self.browse(history_id)
        if record.user_id.id == self.env.user.id:
            record.is_bookmarked = not record.is_bookmarked
            return record.is_bookmarked
        return False

    @api.model
    def delete_item(self, history_id):
        record = self.browse(history_id)
        if record.user_id.id == self.env.user.id:
            record.unlink()
            return True
        return False

    @api.model
    def clear_history(self):
        self.search([
            ('user_id', '=', self.env.user.id)
        ]).unlink()

        return True
