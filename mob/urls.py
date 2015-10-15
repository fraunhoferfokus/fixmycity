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
from django.conf.urls.defaults import patterns, url
from django.views.generic.simple import redirect_to, direct_to_template
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import login as auth_view_login

from mob.views import check_phonegap


urlpatterns = patterns('',
    url(r'^$', redirect_to, {'url': './menu', 'query_string': 'True'}),
    url(r'^login$', auth_view_login,
        {'template_name': 'fmc-mob/login.html'}),
)

urlpatterns += patterns('mob.views',
    url(r'^crosspost$', 'crosspost'),
    url(r'^phonegap$', redirect_to,
        { 'url': './menu?phonegap=1' }),
    url(r'^logout$', 'logout',
        name='mob-logout'),
    url(r'^settings/social/geturl.json', 'urlkey_login',
        name='mob-get-key'),
)

urlpatterns += patterns('',
    url(r'^menu$', check_phonegap(login_required(direct_to_template)),
        {'template': 'fmc-mob/menu.html'},
        name='mob-menu'),
    url(r'^settings$', login_required(direct_to_template),
        {'template': 'fmc-mob/settings.html'},
        name='mob-settings'),
    url(r'^settings/social/dialog$', login_required(direct_to_template),
        {'template': 'fmc-mob/dialog_external.html'},
        name='mob-dialog-social'),
    url(r'^reports$', login_required(direct_to_template),
        {'template': 'fmc-mob/reports.html'},
        name='mob-reports-menu'),
    url(r'^reports/new', login_required(direct_to_template),
        {'template': 'fmc-mob/newreport.html'},
        name='mob-newreport'),
    url(r'^reports/detail', login_required(direct_to_template),
        {'template': 'fmc-mob/reportdetails.html'},
        name='mob-reportdetails'),
    url(r'^reports/nearby', login_required(direct_to_template),
        {'template': 'fmc-mob/reportsnearby.html'},
        name='mob-reports-nearby'),
    url(r'^reports/list', login_required(direct_to_template),
        {'template': 'fmc-mob/reportsview.html'},
        name='mob-reports-list'),
    url(r'^reports/search', login_required(direct_to_template),
        {'template': 'fmc-mob/customsearch.html'},
        name='mob-search'),
)

#urlpatterns += patterns('',
#    # hack for static files
#    url(r'^(?P<whereto>.*)$', redirect_to,
#        {'url': '/static/fmc-mob/%(whereto)s'}),
#)

