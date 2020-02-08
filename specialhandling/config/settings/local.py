# -*- coding: utf-8 -*-
"""
Local settings

- Run in Debug mode

- Use console backend for emails

- Add Django Debug Toolbar
- Add django-extensions as app
"""
import os

from .base import *  # noqa

# DEBUG
# ------------------------------------------------------------------------------
DEBUG = env('DJANGO_DEBUG', default=True)
TEMPLATES[0]['OPTIONS']['debug'] = DEBUG

# SECRET CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#secret-key
# Note: This key only used for development and testing.
SECRET_KEY = env('DJANGO_SECRET_KEY', default='CHANGEME!!!')

# SITE CONFIGURATION
# ------------------------------------------------------------------------------
# Hosts/domain names that are valid for this site
# See https://docs.djangoproject.com/en/1.11/ref/settings/#allowed-hosts
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['localhost', '.ngrok.io'])

# Mail settings
# ------------------------------------------------------------------------------
EMAIL_PORT = 1025
EMAIL_HOST = 'localhost'
EMAIL_BACKEND = env('DJANGO_EMAIL_BACKEND',
                    default='django.core.mail.backends.console.EmailBackend')

# CACHING
# ------------------------------------------------------------------------------
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': ''
    }
}

# django-debug-toolbar
# (commented out, uncomment if you need to use it)
# ------------------------------------------------------------------------------
# MIDDLEWARE += ['debug_toolbar.middleware.DebugToolbarMiddleware', ]
# INSTALLED_APPS += ('debug_toolbar', )

INTERNAL_IPS = ['127.0.0.1', '10.0.2.2', ]

DEBUG_TOOLBAR_CONFIG = {
    'DISABLE_PANELS': [
        'debug_toolbar.panels.redirects.RedirectsPanel',
    ],
    'SHOW_TEMPLATE_CONTEXT': True,
}

# django-extensions
# ------------------------------------------------------------------------------
INSTALLED_APPS += ('django_extensions', )

# TESTING
# ------------------------------------------------------------------------------
TEST_RUNNER = 'django.test.runner.DiscoverRunner'

# Rest Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
}

# Your local stuff: Below this line define 3rd party library settings
