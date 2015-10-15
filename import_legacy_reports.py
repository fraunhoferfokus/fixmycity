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
#! /usr/bin/env python

import sys
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.models import User

from smn.backend.FMC import FMCMixin
import api.models

start = int(sys.argv[1])
end   = int(sys.argv[2])

TEST_USERNAME = 'Tom'

reports = FMCMixin.dump_API(start, end)

try:
    user = User.objects.get(username=TEST_USERNAME)
except ObjectDoesNotExist:
    user = User(username=TEST_USERNAME, email='no@example.com')
    user.save()

for report in reports:
    data = report['fmc_api']
    title = data['title']
    tags = data['tags']
    description = data['description']

    status = api.models.Status.objects.get(pk=data['status']['id'])

    del data['address']['@Hjid']
    address = api.models.Address(
            latitude  = data['geolocation']['latitude'],
            longitude = data['geolocation']['longitude'],
            **data['address']
            )
    address.save()

    category = api.models.Category.objects.get(pk=data['category']['id'])
    creationTime = data['creationTime'].replace('T', ' ')

    report = api.models.Report(
            title = title,
            tags = tags,
            description = description,
            user = user,
            status = status,
            address = address,
            category = category,
            creationTime = creationTime,
            )
    report.save()

