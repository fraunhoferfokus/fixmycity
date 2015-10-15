'''
/*******************************************************************************
 * 
 * Copyright (c) 2015 Fraunhofer FOKUS, All rights reserved.
 * 
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3.0 of the License, or (at your option) any later version.
 * 
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library. If not, see <http://www.gnu.org/licenses/>. 
 * 
 * AUTHORS: Louay Bassbouss (louay.bassbouss@fokus.fraunhofer.de)
 *
 ******************************************************************************/

'''
import sys
import os
from os.path import abspath, dirname, basename, join
from registration_defaults.settings import *

sys.path.append(os.getcwd())

DEBUG = False
CONCURRENT_DEVSERVER = False
TEMPLATE_DEBUG = DEBUG

ROOT_PATH = abspath(dirname(__file__))
PROJECT_NAME = basename(ROOT_PATH)

ADMINS = (
    ('Megaman', 'nomail@example.com'),
)

MANAGERS = ADMINS

MINIFIED = True

APPEND_SLASH = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': join(ROOT_PATH, 'db.sqlite'),
        'USER': '',
        'PASSWORD': '',
        'HOST': '',
        'PORT': '',
    }
}

MAP_PROVIDER = "google" # "google" or "bing"
BING_MAP_API_KEY = "AtPWDSH6mxpS3k8kLWJ8mxyxeueyHWepnUAXwF9h-_M4H7obhEfMxSPVE0_lbtl2"
GEOCODER_PROVIDER = "google" # "google" or "bing"

TIME_ZONE = 'Europe/Berlin'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = False
USE_L10N = False

# Where static files are located on DISK (use absolute path for STATIC_ROOT)
STATIC_ROOT = "/static/"
MEDIA_ROOT = join(STATIC_ROOT, 'media/')

# How static files are seen from the OUTSIDE
STATIC_URL = '/static/'
MEDIA_URL = '/media/'
ADMIN_MEDIA_PREFIX = join(STATIC_URL, 'grappelli/')

# Additional locations of static files
#STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
#)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '%u(8g17%zp9^cwy-845x3z8we*tr%o056nhdb4k8q5ysw2!s9y'

TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    #'django.middleware.cache.UpdateCacheMiddleware',
    'django.middleware.common.CommonMiddleware',
    #'django.middleware.cache.FetchFromCacheMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'urlauth.middleware.AuthKeyMiddleware',
)

ROOT_URLCONF = 'fixmycity.urls'

TEMPLATE_DIRS = (
    # Don't forget to use absolute paths, not relative paths.
    join(ROOT_PATH, 'templates')
)

TEMPLATE_CONTEXT_PROCESSORS = (
        'django.contrib.auth.context_processors.auth',
        'django.core.context_processors.debug',
        #'django.core.context_processors.i18n',
        'django.core.context_processors.media',
        'django.core.context_processors.static',
        'django.core.context_processors.request',
        'django.contrib.messages.context_processors.messages',
        'social_auth.context_processors.social_auth_by_type_backends',
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'registration_defaults',
    'grappelli.dashboard',
    'grappelli',
    'django.contrib.admin',
    'django.contrib.admindocs',
    'tastypie',
    'registration',
    'social_auth',
    'urlauth',
    'api',
    'mob',
    'dummy',
    #'sapi',
    'djsupervisor',
    'djcelery',
)

CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'unique-snowflake',
            'TIMEOUT': 100,
            }
        }
CACHE_MIDDLEWARE_ALIAS = 'default'
CACHE_MIDDLEWARE_SECONDS = 1
CACHE_MIDDLEWARE_KEY_PREFIX = ''
CACHE_MIDDLEWARE_ANONYMOUS_ONLY = False

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

########################
# Social Auth Settings #
########################

AUTHENTICATION_BACKENDS = (
        'social_auth.backends.twitter.TwitterBackend',
        'social_auth.backends.facebook.FacebookBackend',
        #'social_auth.backends.google.GoogleOAuthBackend',
        #'social_auth.backends.google.GoogleOAuth2Backend',
        #'social_auth.backends.google.GoogleBackend',
        'social_auth.backends.yahoo.YahooBackend',
        'social_auth.backends.browserid.BrowserIDBackend',
        #'social_auth.backends.contrib.linkedin.LinkedinBackend',
        'social_auth.backends.contrib.livejournal.LiveJournalBackend',
        #'social_auth.backends.contrib.orkut.OrkutBackend',
        'social_auth.backends.contrib.foursquare.FoursquareBackend',
        #'social_auth.backends.contrib.github.GithubBackend',
        #'social_auth.backends.contrib.dropbox.DropboxBackend',
        'social_auth.backends.contrib.flickr.FlickrBackend',
        'social_auth.backends.contrib.instagram.InstagramBackend',
        'social_auth.backends.OpenIDBackend',
        'django.contrib.auth.backends.ModelBackend',
        )

SOCIAL_AUTH_SANITIZE_REDIRECTS = False
SOCIAL_AUTH_COMPLETE_URL_NAME  = 'socialauth_complete'
SOCIAL_AUTH_ASSOCIATE_URL_NAME = 'socialauth_associate_complete'
# a field with this name is appended to user.session (stores last error)
SOCIAL_AUTH_SESSION_EXPIRATION = True
SOCIAL_AUTH_EXPIRATION         = 'expires'

#SOCIAL_AUTH_LOGIN_REDIRECT_URL    = '/accounts/social/done'
#SOCIAL_AUTH_NEW_USER_REDIRECT_URL = '/'
SOCIAL_AUTH_NEW_ASSOCIATION_REDIRECT_URL = '/accounts/social/done'
SOCIAL_AUTH_DISCONNECT_REDIRECT_URL      = '/accounts/social/done'

FACEBOOK_EXTENDED_PERMISSIONS     = ['publish_stream',
                                     'read_friendlists',
                                     'offline_access',
                                     'read_stream']
FACEBOOK_AUTH_EXTRA_ARGUMENTS     = {'display': 'touch'}


# For django-registration
ACCOUNT_ACTIVATION_DAYS = 7
REGISTRATION_OPEN = True

# Django AUTH system
LOGIN_URL = '/fmc-mob/login'
#LOGOUT_URL = '/lulz/'
LOGIN_ERROR_URL = '/accounts/social/error/'
LOGIN_REDIRECT_URL = '/fmc-mob/menu'

# For urlauth
URLAUTH_AUTHKEY_TIMEOUT = 60 * 60 # valid for 1 hour
URLAUTH_AUTHKEY_NAME = 'authkey'

try:
    from social_settings import *
except:
    pass

# for celery support
BROKER_HOST         = 'localhost'
BROKER_PORT         = 5672
BROKER_USER         = 'guest'
BROKER_PASSWORD     = 'guest'
BROKER_VHOST        = '/'
CELERYD_CONCURRENCY = 4 # XXX: sqlite restricts to one process

import djcelery
djcelery.setup_loader()
# end celery support

# For Tasty API
API_LIMIT_PER_PAGE            = 20
TASTYPIE_FULL_DEBUG           = True
TASTYPIE_CANNED_ERROR         = 'Oops, we broke it!'
TASTYEPIE_ALLOW_MISSING_SLASH = False
TASTYPIE_DATETIME_FORMATTING  = 'iso-8601' # options are iso-8601 & rfc-2822
# end tasty

GRAPPELLI_ADMIN_TITLE     = 'FixMyCity Management Console'
GRAPPELLI_INDEX_DASHBOARD = 'fixmycity.dashboard.CustomIndexDashboard'

