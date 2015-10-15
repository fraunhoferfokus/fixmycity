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
from django.http import HttpResponseRedirect, HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.views import logout_then_login
from django.contrib.messages.api import get_messages
from django.shortcuts import render_to_response
from django.template import RequestContext
from urlauth.models import AuthKey
import json, requests

from fixmycity import __version__ as version
import settings


def check_phonegap(function=None):
    """
    Decorator. Checks if the phonegap parameter is provided
    and sets the 'phonegap' flag in the session.
    """
    def _dec(view_func):
        def _view(request, *args, **kwargs):
            if request.GET.get('phonegap'):
                request.session['phonegap'] = bool(int(request.REQUEST.get('phonegap')))
                print("PhoneGap enabled: %s" % str(request.session['phonegap']))
            return view_func(request, *args, **kwargs)
        return _view
    return _dec(function) if function else None


@login_required
def urlkey_login(request):
    if True or request.session.get('phonegap') and request.user.is_authenticated():
        entryurl = AuthKey.objects.wrap_url('http://'+request.get_host()
                +'/accounts/social/done', uid=request.user.id)
        return HttpResponse(json.dumps({"url": entryurl}), mimetype='application/json')
    else:
        return HttpResponse(status=403)


def logout(request):
    if request.session.get('phonegap', False):
        return logout_then_login(request, 'phonegap')
    else:
        return logout_then_login(request)


# from socialregistration test app
def social_login(request):
    """Home view, displays login mechanism"""
    if request.user.is_authenticated():
        from django.core.urlresolvers import reverse
        return HttpResponseRedirect(reverse(social_done))
    else:
        return render_to_response('social/home.html',
                {'version': version}, RequestContext(request))


@login_required
def social_done(request):
    """Login complete view, displays user data"""
    ctx = {'version': version,
            'last_login': request.session.get('social_auth_last_login_backend')}
    return render_to_response('social/done.html', ctx, RequestContext(request))


def social_error(request):
    """Error view"""
    messages = get_messages(request)
    return render_to_response('social/error.html',
            {'version': version, 'messages': messages}, RequestContext(request))


@csrf_exempt
def crosspost(request):
    """
    Proxy that calls crosspost function of social media Engine.

    """
    try:
        cid = request.REQUEST['cid']
        assocs = request.user.social_auth.all()#, provider='facebook')
    except:
        return HttpResponse('cid missing or not authenticated', status=300)
    # build backend name -> raw token mapping
    tokens = dict(
            [(assoc.provider.lower(), assoc.extra_data.get('access_token')) \
                    for assoc in assocs]
            )
    res = requests.post( # make call to social engine API
            settings.SAPI_ENDPOINT + 'publish/',
            data={
                'eid': cid,
                'tokens': json.dumps(tokens),
                'async': 1,
                },
            )
    return HttpResponse('ok' if res.ok else 'fail',
                        status=200 if res.ok else 500)

