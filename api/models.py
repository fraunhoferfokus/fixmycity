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
# coding: utf-8
from django.db import models, connection
from django.db.backends.signals import connection_created
from django.core.exceptions import ObjectDoesNotExist
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.dispatch import receiver
from math import sin, cos, acos, radians
import logging as log
import requests, json
import datetime


def distance(lat1, lng1, lat2, lng2):
    """Distance calculation between points"""
    multiplier = 6371 # for kilometers
    #multiplier = 3959 # for miles
    return (multiplier *
            acos(
                cos( radians(lat1) ) *
                cos( radians(lat2) ) *
                cos( radians(lng2) - radians(lng1) ) +
                sin( radians(lat1) ) * sin( radians(lat2) )
                )
            )


@receiver(connection_created)
def setup_proximity_func(connection,**kwargs):
    """add the distance function to sqlite"""
    connection.connection.create_function('distance', 4, distance)


class ReportQuerySet(models.query.QuerySet):
    """Report query set"""
    def nearby(self, lat, lng, km):
        """finds locations within <distance> km of <lat>/<lng>"""
        cursor = connection.cursor()
        sql = """SELECT api_report.id, addr.dist
        FROM api_report, (SELECT id,
        distance(%f,%f,latitude,longitude) AS dist FROM api_address
        WHERE dist < %d) AS addr
        WHERE addr.id = api_report.address_id
        ORDER BY addr.dist;""" % (lat, lng, km)
        cursor.execute(sql)
        ids = [row[0] for row in cursor.fetchall()]
        return self.filter(id__in=ids)

    # see http://bit.ly/airLXz
    def _filter_or_exclude(self, negate, *args, **kwargs):
        try:
            value = kwargs.pop('address__dst')
            matches = self.nearby(*map(float, value.split(',')))
            pks = [m.pk for m in matches]
            kwargs.update({ 'pk__in': pks })
        except:
            pass
        return super(ReportQuerySet, self)._filter_or_exclude(
                negate, *args, **kwargs)


class ReportManager(models.Manager):
    """Location model manager"""
    def get_query_set(self):
        return ReportQuerySet(self.model)

    def __getattr__(self, name):
        return getattr(self.get_query_set(), name)


class ReportWebHook(models.Model):
    class Meta:
        verbose_name_plural = 'Update Notification Subscriptions'

    WHEN_CHOICES = [
            (1, 'creation or update'),
            (2, 'only update'),
            (3, 'only creation'),
            ]

    callback = models.URLField(max_length=200, unique=False)
    reports  = models.ManyToManyField('api.Report', blank=True)
    when     = models.IntegerField(default=1, choices=WHEN_CHOICES)
    active   = models.BooleanField(default=True)

    def __unicode__(self):
        count = self.reports.count() or 'all'
        state = ' (disabled)' if not self.active else ''
        return 'Callback%s: %s (for %s reports on %s)' \
                % (state, self.callback, count, self.get_when_display())

    def fire(self, ids):
        if not self.active:
            return

        payload = {
                'ids': ids or [r.pk for r in self.reports.all()],
                'change': self.when
                }
        try:
            log.info('Firing webhook %s' % self.callback)
            requests.post(self.callback,
                    data=json.dumps(payload),
                    timeout=2,
                    headers={'content-type': 'application/json'})
        except:
            log.error('Webhook failed (%s)!' % self.callback)


class Status(models.Model):
    class Meta:
        verbose_name_plural = 'statuses'

    title = models.CharField(max_length=50, unique=True)

    def __unicode__(self):
        return self.title


class Category(models.Model):
    class Meta:
        verbose_name_plural = 'categories'

    title = models.CharField(max_length=50, unique=True)

    def __unicode__(self):
        return self.title


class Address(models.Model):
    class Meta:
        verbose_name_plural = 'addresses'

    country = models.CharField(max_length=50, blank=True)
    countryCode = models.CharField(max_length=10, blank=True)
    city = models.CharField(max_length=50, blank=True)
    postalCode = models.CharField(max_length=20, blank=True)
    street = models.CharField(max_length=100, blank=True)
    houseNo = models.CharField(max_length=10, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __unicode__(self):
        if self.street and self.city:
            return '%s, %s' % (self.street, self.city)
        else:
            return '(%.2f, %.2f)' % (self.latitude, self.longitude)


class Comment(models.Model):
    report = models.ForeignKey('api.Report')
    user = models.ForeignKey(User)
    creationTime = models.DateTimeField(default=datetime.datetime.now)
    newStatus = models.ForeignKey(Status, blank=True, null=True)
    message = models.TextField()

    def __unicode__(self):
        return '%s: %s' % (self.user or 'Anonymous', self.message)


class Rating(models.Model):
    VALUE_CHOICES = [(i, i) for i in range(1, 6)]

    report = models.ForeignKey('api.Report')
    user = models.ForeignKey(User)
    value = models.IntegerField(default=1, choices=VALUE_CHOICES)
    creationTime = models.DateTimeField(default=datetime.datetime.now)

    def __unicode__(self):
        return 'Rating of %d by %s' % (self.value, self.user or 'Anonymous')


class Photo(models.Model):
    report = models.ForeignKey('api.Report')
    photo = models.ImageField(upload_to='photos')
    user = models.ForeignKey(User, related_name='photo_attachment')

    def __unicode__(self):
        return self.photo.name

    def save(self, *args, **kwargs):
        """Trigger report update webhook on photo upload"""
        super(Photo, self).save(*args, **kwargs)

        # 'updated' and 'created and updated'
        hooks = set(self.report.reportwebhook_set.filter(when__in=[1, 2]))
        hooks.update(ReportWebHook.objects.filter(reports__isnull=True,
            when__in=[1, 2]))
        [hook.fire([self.report.pk]) for hook in hooks] # XXX make async


class Report(models.Model):
    objects = ReportManager()

    title = models.CharField(max_length=100)
    tags = models.CharField(max_length=1000, blank=True)
    description = models.TextField()
    user = models.ForeignKey(User)
    status = models.ForeignKey(Status, default=1)
    address = models.OneToOneField(Address)
    category = models.ForeignKey(Category)
    creationTime = models.DateTimeField(default=datetime.datetime.now)

    def __unicode__(self):
        return '%s (by %s)' % (self.title, self.user.username)

    def save(self, *args, **kwargs):
        """On status change, auto-append a comment"""
        try:
            old_status = Report.objects.get(pk=self.pk).status
        except ObjectDoesNotExist:
            old_status = None
        finally:
            super(Report, self).save(*args, **kwargs)

        if old_status != self.status:
            Comment(user=User.objects.get(pk=1), # rely on fixture
                    report=self,
                    newStatus=self.status,
                    message='Status is now: %s.' % self.status
                    ).save()

        when = 3 if old_status == None else 2

        hooks = set(self.reportwebhook_set.filter(when__in=[1, when]))
        hooks.update(ReportWebHook.objects.filter(reports__isnull=True,
            when__in=[1, when]))
        [hook.fire([self.pk]) for hook in hooks] # XXX make async

    def address_admin_link(self):
        return '<a href="%s"><b>%s</b></a>' % (
                reverse('admin:api_address_change', args=(self.address.id,)),
                '%s' % (self.address)
                )
    address_admin_link.allow_tags = True
    address_admin_link.short_description = 'Address'

