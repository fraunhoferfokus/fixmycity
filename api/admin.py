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
from django.contrib import admin
from api.models import *


class PhotoInline(admin.TabularInline):
    model = Photo
    extra = 0


class ReportAdmin(admin.ModelAdmin):
    class Media:
        css = {'all': ()}
        js = () # jQuery is available as django.jQuery

    list_display = ['title', 'category', 'address_admin_link',
                    'status', 'user', 'creationTime']
    list_editable = ['status']
    list_filter = ['category', 'status', 'address__city', 'user']
    list_per_page = 10
    #radio_fields = {'status': admin.VERTICAL}
    ordering = ['-creationTime']
    save_as = True
    date_hierarchy = 'creationTime'
    search_fields = ['title', 'user__username', 'address__city']
    #readonly_fields = ['address', 'creationTime']
    readonly_fields = ['address_admin_link']
    fieldsets = [
            ('Information', {'fields': ['title', 'category',
                'tags', 'description']}),
            ('Reporter', {'fields': ['user', 'creationTime']}),
            ('Location', {'fields': ['address', 'address_admin_link']}),
            ('Administration', {'fields': ['status']}),
            ]
    inlines = [PhotoInline]

    def lookup_allowed(self, lookup, *args, **kwargs):
        if lookup == 'address__dst':
            return True
        return super(ReportAdmin, self).lookup_allowed(lookup, args, **kwargs)


class CommentAdmin(admin.ModelAdmin):
    list_display = ['message', 'user', 'report', 'creationTime']
    list_filter = ['user__username', 'report']
    list_per_page = 10
    ordering = ['-creationTime']
    date_hierarchy = 'creationTime'
    search_fields = ['user__username', 'message']


class RatingAdmin(admin.ModelAdmin):
    list_display = ['creationTime', 'report', 'user', 'value']
    list_filter = ['user__username', 'report']
    list_per_page = 10
    ordering = ['-creationTime']
    date_hierarchy = 'creationTime'
    search_fields = ['user__username', 'value']


class AddressAdmin(admin.ModelAdmin):
    fieldsets = [
            ('Street address', {
                'fields': [
                    ('country', 'countryCode'),
                    ('city', 'postalCode'),
                    ('street', 'houseNo'),
                    ]
                }),
            ('Geolocation', {
                'fields': ['latitude', 'longitude']
                }),
            ]


admin.site.register(Status)
admin.site.register(Category)
admin.site.register(Address, AddressAdmin)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Rating, RatingAdmin)
admin.site.register(Report, ReportAdmin)
admin.site.register(Photo)
admin.site.register(ReportWebHook)

