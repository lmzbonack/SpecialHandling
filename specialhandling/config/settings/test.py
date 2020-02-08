# -*- coding: utf-8 -*-
'''
Test settings

- Used to run tests fast on the continuous integration server and locally
'''
import os

from .base import *  # noqa

# DEBUG
# ------------------------------------------------------------------------------
# Set DEBUG to true so it runs without gatekeeper
DEBUG = env('DJANGO_DEBUG', default=True)
TEMPLATES[0]['OPTIONS']['debug'] = DEBUG

# SECRET CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#secret-key
# Note: This key only used for development and testing.
SECRET_KEY = env('DJANGO_SECRET_KEY', default='CHANGEME!!!')

# In-memory email backend stores messages in django.core.mail.outbox for unit testing purposes
EMAIL_BACKEND = 'django.core.mail.backends.locmem.EmailBackend'

# DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME', default='specialhandling'),
        'USER': env('DATABASE_USER', default='postgres'),
        'PASSWORD': env('DATABASE_PASSWORD', default=''),
        'HOST': env('DATABASE_HOST', default='postgres'),
        'PORT': '',
    }
}
DATABASES['default']['ATOMIC_REQUESTS'] = True

# CACHING
# ------------------------------------------------------------------------------
# Speed advantages of in-memory caching without having to run Memcached
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': ''
    }
}

# TESTING
# ------------------------------------------------------------------------------
TEST_RUNNER = 'django.test.runner.DiscoverRunner'
