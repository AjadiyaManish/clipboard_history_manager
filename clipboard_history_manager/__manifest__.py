{
    'name': 'Clipboard History Manager',
    'version': '19.0.1.0.0',
    'summary': 'Advanced clipboard history tracking inside Odoo',
    'description': """
Clipboard History Manager helps users track, manage, and reuse copied text directly inside Odoo.

Main Features:
- Automatic clipboard history tracking
- Quick access from systray menu
- Copy again with one click
- Clean and modern UI
- User-wise clipboard management
- Secure access rules
- Responsive backend integration

Perfect for improving productivity and managing frequently copied content inside Odoo.
    """,

    'category': 'Productivity',
    'author': 'Envision Technolabs',
    'maintainer': 'Envision Technolabs',
    'website': 'https://www.envisiontechnolabs.com',
    'license': 'LGPL-3',
    'price': 25.00,
    'currency': 'USD',

    'depends': ['web'],

    'images': [
        'static/description/banner.png',
    ],

    'data': [
        'security/clipboard_history_rules.xml',
        'security/ir.model.access.csv',
        'views/clipboard_history_views.xml',
    ],

    'assets': {
        'web.assets_backend': [
            'clipboard_history_manager/static/src/js/clipboard_service.js',
            'clipboard_history_manager/static/src/js/systray_clipboard.js',
            'clipboard_history_manager/static/src/xml/clipboard_templates.xml',
            'clipboard_history_manager/static/src/scss/clipboard_history.scss',
        ],
    },

    'installable': True,
    'application': True,
    'auto_install': False,
}
