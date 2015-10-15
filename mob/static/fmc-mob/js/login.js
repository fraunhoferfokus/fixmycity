
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


(function() {
    // PAGEINIT
    $('#login').live('pageinit', function() {
        $(this).find('form').submit(function(e) {
            e.preventDefault();
            $(this).find('input[type=submit]').button('disable');
            App.username = $.trim($(this).find('input#id_username').val());

            $.mobile.changePage($(this).attr('action'), {
                type: 'post',
                transition: 'fade',
                reloadPage: 'true',
                data: $(this).serialize()
            });
            return false;
        });
    });

    // PAGEBEFORESHOW
    $('#login').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #login");

        $.ap('input[type=submit]').button('enable');
    });

    // PAGESHOW
    $('#login').live('pageshow', function() {
        console.log("=== pageshow for #login");

        // Remove all other pages. Aggressive de-caching.
        $('div[data-role="page"]').each(function(key, page) {
            if(page.id !== 'login'){
                $(page).remove();
                console.log("=== Page "+page.id+" removed from DOM!");
            };
        });
    });
}).call(this);

