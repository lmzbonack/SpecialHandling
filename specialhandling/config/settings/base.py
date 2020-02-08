# -*- coding: utf-8 -*-
"""
Django settings for specialhandling project.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.11/ref/settings/
"""
import environ

ROOT_DIR = environ.Path(__file__) - 3  # (specialhandling/config/settings/base.py - 3 = specialhandling/)
APPS_DIR = ROOT_DIR.path('specialhandling')

env = environ.Env()
env.read_env()

# APP CONFIGURATION
# ------------------------------------------------------------------------------
DJANGO_APPS = (
    # Default Django apps:
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Admin
    'django.contrib.admin',
    'django.core.management',
)

THIRD_PARTY_APPS = (
    'rest_framework',  # Django Rest Framework
    'webpack_loader',
)

# Apps specific for this project go here.
LOCAL_APPS = (
    # Use explicit path
    # 'specialhandling.apples.apps.ApplesConfig', # Example custom apples app
    # Your stuff: custom apps go here
    'specialhandling.checks.apps.ChecksConfig',
    'specialhandling.comments.apps.CommentsConfig',
    'specialhandling.signatures.apps.SignaturesConfig',
)

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#installed-apps
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# MIDDLEWARE CONFIGURATION
# ------------------------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# DEBUG
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#debug
DEBUG = env.bool('DJANGO_DEBUG', False)

# EMAIL CONFIGURATION
# ------------------------------------------------------------------------------
EMAIL_BACKEND = env('DJANGO_EMAIL_BACKEND', default='django.core.mail.backends.smtp.EmailBackend')

# DATABASE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('DATABASE_NAME', default='specialhandling'),
        'USER': env('DATABASE_USER', default='postgres'),
        'PASSWORD': env('DATABASE_PASSWORD', default=''),
        'HOST': env('DATABASE_HOST', default=''),
        'PORT': '',
    }
}
DATABASES['default']['ATOMIC_REQUESTS'] = True

# PASSWORD HASHING
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/topics/auth/passwords
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
]

# GENERAL CONFIGURATION
# ------------------------------------------------------------------------------
# Time zone choices can be found here: http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
TIME_ZONE = 'America/Phoenix'

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#language-code
LANGUAGE_CODE = 'en-us'

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#site-id
SITE_ID = 1

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#use-i18n
USE_I18N = True

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#use-l10n
USE_L10N = True

# TEMPLATE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#templates
TEMPLATES = [
    {
        # See: https://docs.djangoproject.com/en/1.11/ref/settings/#std:setting-TEMPLATES-BACKEND
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        # See: https://docs.djangoproject.com/en/1.11/ref/settings/#template-dirs
        'DIRS': [
            str(APPS_DIR.path('templates'))
        ],
        'OPTIONS': {
            # See: https://docs.djangoproject.com/en/1.11/ref/settings/#template-debug
            'debug': DEBUG,
            # See: https://docs.djangoproject.com/en/1.11/ref/settings/#template-loaders
            # https://docs.djangoproject.com/en/1.11/ref/templates/api/#loader-types
            'loaders': [
                'django.template.loaders.filesystem.Loader',
                'django.template.loaders.app_directories.Loader',
            ],
            # See: https://docs.djangoproject.com/en/1.11/ref/settings/#template-context-processors
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.template.context_processors.i18n',
                'django.template.context_processors.media',
                'django.template.context_processors.static',
                'django.template.context_processors.tz',
                'django.contrib.messages.context_processors.messages',
                # Your stuff: custom template context processors go here
            ],
        },
    },
]

# STATIC FILE CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#static-root
STATIC_ROOT = str(ROOT_DIR('staticfiles'))

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#static-url
STATIC_URL = '/static/'

# See: https://docs.djangoproject.com/en/1.11/ref/contrib/staticfiles/#std:setting-STATICFILES_DIRS
STATICFILES_DIRS = (
    str(APPS_DIR.path('static')),
    ("npm", str(ROOT_DIR.path('node_modules'))),
)

# See: https://docs.djangoproject.com/en/1.11/ref/contrib/staticfiles/#staticfiles-finders
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# MEDIA CONFIGURATION
# ------------------------------------------------------------------------------
# See: https://docs.djangoproject.com/en/1.11/ref/settings/#media-root
MEDIA_ROOT = str(APPS_DIR('media'))

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#media-url
MEDIA_URL = '/media/'

# URL Configuration
# ------------------------------------------------------------------------------
ROOT_URLCONF = 'config.urls'

# See: https://docs.djangoproject.com/en/1.11/ref/settings/#wsgi-application
WSGI_APPLICATION = 'config.wsgi.application'

# AUTHENTICATION CONFIGURATION
# ------------------------------------------------------------------------------
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
)

# Location of root django.contrib.admin URL, use {% url 'admin:index' %}
ADMIN_URL = r'^admin/'

# Rest Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
    ),
}

# Your common stuff: Below this line define 3rd party library settings

WEBPACK_LOADER = {
    'DEFAULT': {
        'CACHE': not DEBUG,
        'BUNDLE_DIR_NAME': 'js/',  # must end with slash
        'STATS_FILE': str(APPS_DIR.path('static/js') + 'asset-manifest.json'),
        'IGNORE': ['.+\.hot-update.js', '.+\.map']
    }
}
