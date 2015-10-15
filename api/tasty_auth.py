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
from tastypie.authentication import Authentication
from tastypie.authentication import Authorization


# django-tastypie.readthedocs.org/en/latest/authentication_authorization.html

class DjangoAuthentication(Authentication):
    """Authenticate based upon Django session"""
    def is_authenticated(self, request, **kwargs):
        return request.user.is_authenticated()


    def get_identifier(self, request):
        return request.user.username



class FunnyAuthorization(Authorization):
    def is_authorized(self, request, object=None):
        return request.user.username == 'alice'


    def apply_limits(self, request, object_list):
        if request and hasattr(request, 'user'):
            return object_list.filter(user__username=request.user.username)

        return object_list.none()

