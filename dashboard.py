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
from django.utils.translation import ugettext_lazy as _
from django.core.urlresolvers import reverse

from grappelli.dashboard import modules, Dashboard
from grappelli.dashboard.utils import get_admin_site_name


class CustomIndexDashboard(Dashboard):
    """
    Custom index dashboard for www.
    """

    def init_with_context(self, context):
        site_name = get_admin_site_name(context)

        self.children.append(modules.ModelList(
                    _('User Administration'),
                    column=1,
                    collapsible=False,
                    models=('django.contrib.auth.*',)
                ),
        )

        self.children.append(modules.AppList(
            _('FixMyCity Management'),
            collapsible=False,
            column=1,
            models=('api.*', 'sapi.*',),
            exclude=('api.models.Rating',
                     'api.models.Photo',
                     'api.models.Address',
                     'api.models.Comment',),
            ))

        self.children.append(modules.ModelList(
            _('Social Authentication Module'),
            collapsible=True,
            column=1,
            css_classes=('collapse closed',),
            models=('social_auth.*',),
            ))

        self.children.append(modules.ModelList(
            _('Asynchronous Task Queue'),
            collapsible=True,
            column=1,
            css_classes=('collapse closed',),
            models=('djcelery.*',),
            ))

        self.children.append(modules.AppList(
            _('Miscellaneous'),
            collapsible=True,
            column=1,
            css_classes=('collapse closed',),
            exclude=('django.contrib.auth.*', 'sapi.*', 'social_auth.*',
                     'api.*', 'djcelery.*',),
        ))

        self.children.append(modules.LinkList(
            _('Support'),
            column=2,
            children=[
                {
                    'title': _('FixMyCity Website'),
                    'url': 'http://www.fixmycity.de/',
                    'external': True,
                },
                {
                    'title': _('FixMyCity Android App'),
                    'url': '/static/FixMyCity.apk',
                    'external': True,
                },
                {
                    'title': _('Django Documentation'),
                    'url': 'http://docs.djangoproject.com/',
                    'external': True,
                },
                {
                    'title': _('Grappelli Documentation'),
                    'url': 'http://packages.python.org/django-grappelli/',
                    'external': True,
                },
                {
                    'title': _('Grappelli Google-Code'),
                    'url': 'http://code.google.com/p/django-grappelli/',
                    'external': True,
                },
            ]
        ))

        # append a feed module
        self.children.append(modules.Feed(
            _('e-Government News'),
            column=2,
            feed_url='http://www.guardian.co.uk/technology/e-government/rss',
            limit=5
        ))

        # append a recent actions module
        self.children.append(modules.RecentActions(
            _('Recent Actions'),
            limit=5,
            collapsible=False,
            column=3,
        ))

