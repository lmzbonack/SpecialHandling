# -*- coding: utf-8 -*-
"""
Production Configurations

- Use djangosecure
"""
import logging

from .base import *

# SECRET CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#secret-key
# Raises ImproperlyConfigured exception if DJANGO_SECRET_KEY not in os.environ
SECRET_KEY = env('DJANGO_SECRET_KEY')
# Required for gatekeeper
AD_API_KEY = env('AD_API_KEY')
EDS_API_KEY = env('EDS_API_KEY')

# Application administrators defined in an AD group
APP_ADMIN_GROUP = 'specialhandling-UserAdmins'

# This ensures that Django will be able to detect a secure connection
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# raven sentry client
# See https://docs.getsentry.com/hosted/clients/python/integrations/django/
AUTHENTICATION_BACKENDS = [
    'uashib.backend.ShibbolethBackend',
]
INSTALLED_APPS += (
    'gatekeeper',
    'raven.contrib.django.raven_compat',
    'uashib',
)
MIDDLEWARE += [
    'raven.contrib.django.raven_compat.middleware.SentryResponseErrorIdMiddleware',
    'uashib.middleware.ShibbolethMiddleware',
]
RAVEN_CONFIG = {
    'DSN': env('SENTRY_DSN')
}

# SECURITY CONFIGURATION
# ------------------------------------------------------------------------------
# See https://docs.djangoproject.com/en/1.11/ref/middleware/#module-django.middleware.security
SECURE_CONTENT_TYPE_NOSNIFF = env.bool(
    'DJANGO_SECURE_CONTENT_TYPE_NOSNIFF', default=True)
SECURE_BROWSER_XSS_FILTER = True
SESSION_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = env.bool('DJANGO_SECURE_SSL_REDIRECT', default=True)
CSRF_USE_SESSIONS = True
X_FRAME_OPTIONS = 'DENY'

# SITE CONFIGURATION
# ------------------------------------------------------------------------------
# Hosts/domain names that are valid for this site
# See https://docs.djangoproject.com/en/1.11/ref/settings/#allowed-hosts
ALLOWED_HOSTS = env.list('DJANGO_ALLOWED_HOSTS', default=['specialhandling.fso.arizona.edu', 'specialhandling-dev.fso.arizona.edu'])

# EMAIL
# ------------------------------------------------------------------------------
EMAIL_HOST = 'smtpgate.email.arizona.edu'
EMAIL_USE_LOCALTIME = True

# TEMPLATE CONFIGURATION
# ------------------------------------------------------------------------------
# See https://docs.djangoproject.com/en/1.11/ref/templates/api/#django.template.loaders.cached.Loader
TEMPLATES[0]['OPTIONS']['loaders'] = [
    ('django.template.loaders.cached.Loader', [
        'django.template.loaders.filesystem.Loader', 'django.template.loaders.app_directories.Loader', ]),
]

# DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
# Raises ImproperlyConfigured exception if DATABASE_URL not in os.environ
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME'),
        'USER': env('DATABASE_USER'),
        'PASSWORD': env('DATABASE_PASSWORD'),
        'HOST': env('DATABASE_HOST'),
    }
}

# Logging Configuration
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'root': {
        'level': 'WARNING',
        'handlers': ['sentry'],
    },
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s '
                      '%(process)d %(thread)d %(message)s'
        },
    },
    'handlers': {
        'sentry': {
            'level': 'ERROR',
            'class': 'raven.contrib.django.raven_compat.handlers.SentryHandler',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'null': {
            'class': 'logging.NullHandler',
        },
    },
    'loggers': {
        'django.request': {
            'level': 'ERROR',
            'handlers': ['console', 'sentry'],
            'propagate': False,
        },
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console', 'sentry'],
            'propagate': False,
        },
        'django.security.DisallowedHost': {
            'handlers': ['null'],
            'propagate': False,
        },
        'raven': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
        'sentry.errors': {
            'level': 'DEBUG',
            'handlers': ['console'],
            'propagate': False,
        },
    }
}

# Custom Admin URL, use {% url 'admin:index' %}
ADMIN_URL = env('DJANGO_ADMIN_URL')

# Your production stuff: Below this line define 3rd party library settings
