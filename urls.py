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
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.views.generic.simple import redirect_to
from django.conf.urls.defaults import patterns, include, url
from django.contrib.auth.views import logout_then_login
from django.contrib import admin
from django.conf.urls.static import  static
from django.conf import settings
import registration.views
import mob.views

admin.autodiscover()

# admin panel and account management
urlpatterns = patterns('',
    url(r'^grappelli/', include('grappelli.urls')),
    url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    url(r'^admin/', include(admin.site.urls)),

    # social auth integration
    url(r'^accounts/social/$', mob.views.social_login, name='social_login'),
    url(r'^accounts/social/done/$', mob.views.social_done, name='social_done'),
    url(r'^accounts/social/error/$', mob.views.social_error, name='social_error'),
    url(r'^accounts/social/', include('social_auth.urls')),

    # django registartion integration
    url(r'^accounts/register$', registration.views.register,
        {'backend': 'customregistration.SimpleBackend',
            'success_url': '/fmc-mob/',},
        name='registration_register'),

    # normal django account system
    url(r'^accounts/logout/$', logout_then_login,
        name="auth_logout"),
    url(r'^accounts/', include('customregistration.urls')),

    # mobile application
    url(r'^fmc-mob/', include('mob.urls')),

    # API proxy
    url(r'^fmc-api/', include('api.urls')),

    # social API
    # url(r'^smn-api/', include('sapi.urls')),

    # forward to mobile app per default
    url(r'^$', redirect_to, {'url': '/fmc-mob/'}),
)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += staticfiles_urlpatterns()

