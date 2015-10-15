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
from django.contrib.auth.models import User
from django.core.exceptions import MultipleObjectsReturned, ObjectDoesNotExist
from tastypie import fields
from tastypie.utils import trailing_slash, dict_strip_unicode_keys
from tastypie.http import HttpGone, HttpMultipleChoices
from tastypie.authentication import Authentication
from tastypie.authorization import Authorization
from django.conf.urls.defaults import url
from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from tastypie.cache import SimpleCache
import api.models


class ReportResource(ModelResource):
    user        = fields.ToOneField('api.tasty.UserResource', 'user', full=True)
    status      = fields.ToOneField('api.tasty.StatusResource', 'status', full=True)
    category    = fields.ToOneField('api.tasty.CategoryResource', 'category', full=True)
    address     = fields.ToOneField('api.tasty.AddressResource', 'address', full=True)

    comments    = fields.ToManyField('api.tasty.CommentResource', 'comment_set', related_name='report', blank=True)
    ratings     = fields.ToManyField('api.tasty.RatingResource', 'rating_set', related_name='report', blank=True)
    photos      = fields.ToManyField('api.tasty.PhotoResource', 'photo_set', related_name='report', blank=True, full=True)

    class Meta:
        resource_name = 'reports'
        queryset = api.models.Report.objects.all()
        authentication = Authentication()
        authorization = Authorization()
        list_allowed_methods = ['get', 'post']
        detail_allowed_methods = ['get', 'post', 'put', 'delete'] # no 'patch'
        always_return_data = True # XXX
        #cache = SimpleCache()
        filtering = {
                'user': ALL_WITH_RELATIONS,
                'status': ALL_WITH_RELATIONS,
                'photos': ALL_WITH_RELATIONS,
                'tags': ['icontains'],
                'address': ALL_WITH_RELATIONS,
                'category': ALL_WITH_RELATIONS,
                'creationTime': ['exact', 'range', 'lt', 'lte', 'gte', 'gt'],
                }
        ordering = ['id', 'creationTime']

    def build_filters(self, filters={}):
        """Add custom filters (radius, onlyWithPhotos)"""
        orm_filters = super(ReportResource, self).build_filters(filters)

        # filter by photos
        photos = api.models.Photo.objects.all()
        try:
            if int(filters.get('onlyWithPhotos')) == 1:
                orm_filters['pk__in'] = set([p.report.pk for p in photos])
        except:
            pass

        # filter by distance
        try:
            lat = float(filters.get('latitude'))
            lng = float(filters.get('longitude'))
            rad = float(filters.get('radius'))

            reports = api.models.Report.objects.nearby(lat, lng, rad)
            pks = [r.pk for r in reports]
            try:
                orm_filters['pk__in'] = orm_filters['pk__in'].intersection(pks)
            except:
                orm_filters['pk__in'] = pks
        except:
            pass

        return orm_filters

    def obj_create(self, bundle, request=None, **kwargs):
        return super(ReportResource, self).obj_create(bundle, request,
                user=request.user)

    def hydrate_address(self, bundle):
        resrc = AddressResource()
        addr = dict((k[5:], v) for k,v in bundle.data.iteritems() \
                if k.startswith('addr_'))
        geo  = dict((k[4:], float(v)) for k,v in bundle.data.iteritems() \
                if k.startswith('geo_'))
        addr.update(geo)
        addrbundle = resrc.build_bundle(obj=api.models.Address,
                data=dict_strip_unicode_keys(addr))
        addrobj = resrc.obj_create(addrbundle).obj
        bundle.obj.address = addrobj
        return bundle

    def dehydrate(self, bundle):
        """
        Calculate averageRating and append to response bundle.

        """
        total_score = 0.0
        ratings = api.models.Rating.objects.filter(report__id=bundle.obj.id)
        if not ratings.count():
            return bundle

        for rating in ratings:
            total_score += rating.value
        bundle.data['averageRating'] = total_score / ratings.count()

        return bundle

    def dehydrate_description(self, bundle):
        #return bundle.data['description'].upper()
        return bundle.data['description'] # do nothing

    # nested resources
    # ref: latest/cookbook.html#nested-resources
    def override_urls(self):
        return [
                url(r"^reports/(?P<pk>\d+)/(?P<nest_resource>\w+)%s$" \
                        % trailing_slash(), self.wrap_view('handle_nested'),
                        name='api_handle_nested'),
                ]

    def handle_nested(self, request, **kwargs):
        resource_name = kwargs.pop('nest_resource')
        resource = self.fields[resource_name].to_class().__class__

        try:
            stripped_kwargs = self.remove_api_resource_names(kwargs)
            obj = self.cached_obj_get(request=request, **stripped_kwargs)
        except ObjectDoesNotExist:
            return HttpGone()
        except MultipleObjectsReturned:
            return HttpMultipleChoices('Multiple objects with this PK.')

        r = resource()
        if request.method.lower() == 'get':
            return r.get_list(request, report=obj.pk)
        elif request.method.lower() == 'post':
            cont_type = request.META.get('CONTENT_TYPE', 'application/json')
            deserialized = r.deserialize(request, format=cont_type)

            report_uri = ReportResource().get_resource_uri(obj)
            user_uri = UserResource().get_resource_uri(request.user)

            parms = {'report': report_uri, 'user': user_uri}
            if 'form' in cont_type:
                deserialized = dict(
                        (str(k), v[0] if (type(v)==list and len(v)>0) else v) \
                                for k, v in deserialized.iteritems())
            parms.update(deserialized)
            try:
                bundle = r.build_bundle(
                        data=dict_strip_unicode_keys(parms),
                        request=request
                        )
                r.is_valid(bundle, request)
                r.obj_create(bundle) # this creates the actual child
            except:
                raise ValueError(parms)
            bundle_dehyd = r.full_dehydrate(bundle);
            resp = r.create_response(request, bundle_dehyd)
            resp['location'] = r.get_resource_uri(bundle)
            resp.status_code = 201
            return resp
        else:
            raise NotImplementedError('In POST and GET we trust.')


class UserResource(ModelResource):
    class Meta:
        resource_name = 'users'
        queryset = User.objects.all()
        excludes = ['email', 'password', 'is_active', 'last_login',
                    'first_name', 'last_name',
                    'date_joined', 'is_staff', 'is_superuser']
        allowed_methods = ['get']
        #cache = SimpleCache()
        filtering = { 'username': ALL, }
        ordering = ['username', 'id']


class StatusResource(ModelResource):
    class Meta:
        resource_name = 'statuses'
        queryset = api.models.Status.objects.all()
        #cache = SimpleCache()


class CategoryResource(ModelResource):
    class Meta:
        resource_name = 'categories'
        queryset = api.models.Category.objects.all()
        #cache = SimpleCache()


class AddressResource(ModelResource):
    class Meta:
        queryset = api.models.Address.objects.all()
        excludes = ['id']
        #cache = SimpleCache()


class CommentResource(ModelResource):
    report = fields.ToOneField('api.tasty.ReportResource', 'report')
    user = fields.ToOneField(UserResource, 'user', full=True)
    newStatus = fields.ToOneField(StatusResource, 'newStatus', full=True,
            blank=True, null=True)

    class Meta:
        resource_name = 'comments'
        queryset = api.models.Comment.objects.all()
        authentication = Authentication()
        authorization = Authorization()
        #cache = SimpleCache()
        filtering = {
                'report': ALL,
                'user': ALL_WITH_RELATIONS,
                }
        ordering = ['creationTime', 'newStatus', 'user', 'report', 'id']


class RatingResource(ModelResource):
    report = fields.ToOneField('api.tasty.ReportResource', 'report')
    user = fields.ToOneField(UserResource, 'user', full=True)

    class Meta:
        resource_name = 'ratings'
        queryset = api.models.Rating.objects.all()
        #cache = SimpleCache()
        filtering = {
                'report': ALL,
                'user': ALL_WITH_RELATIONS,
                }


class PhotoResource(ModelResource):
    report = fields.ToOneField('api.tasty.ReportResource', 'report')
    user = fields.ToOneField(UserResource, 'user')

    class Meta:
        resource_name = 'photos'
        queryset = api.models.Photo.objects.all()
        #cache = SimpleCache()
        filtering = {
                'report': ALL,
                }

