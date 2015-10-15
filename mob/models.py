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
import registration.signals
from django.contrib.auth.models import Group
from django.db import IntegrityError

##################
# Signal callbacks
##################

# add user to fmc_user group by default
def user_registered_cb(sender, user, request, **kwargs):
    print "USER REGISTERED SIGNAL HANDLER FOR: %s" % str(user)
    try:
        Group.objects.create(name='fmc_user')
    except IntegrityError:
        pass # group already exists
    fmc_users = Group.objects.get(name='fmc_user')
    user.groups.add(fmc_users)
    user.save()

registration.signals.user_registered.connect(
        user_registered_cb,
        dispatch_uid="user_registered"
        )

