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
from django.template import TemplateSyntaxError, Node, Variable, Library
from django.conf import settings

register = Library()
# I found some tricks in URLNode and url from defaulttags.py:
# https://code.djangoproject.com/browser/django/trunk/django/template/defaulttags.py
@register.tag
def value_from_settings(parser, token):
  bits = token.split_contents()
  if len(bits) < 2:
    raise TemplateSyntaxError("'%s' takes at least one " \
      "argument (settings constant to retrieve)" % bits[0])
  settingsvar = bits[1]
  settingsvar = settingsvar[1:-1] if settingsvar[0] == '"' else settingsvar
  asvar = None
  bits = bits[2:]
  if len(bits) >= 2 and bits[-2] == 'as':
    asvar = bits[-1]
    bits = bits[:-2]
  if len(bits):
    raise TemplateSyntaxError("'value_from_settings' didn't recognise " \
      "the arguments '%s'" % ", ".join(bits))
  return ValueFromSettings(settingsvar, asvar)

class ValueFromSettings(Node):
  def __init__(self, settingsvar, asvar):
    self.arg = Variable(settingsvar)
    self.asvar = asvar
  def render(self, context):
    ret_val = getattr(settings,str(self.arg))
    if self.asvar:
      context[self.asvar] = ret_val
      return ''
    else:
      return ret_val

