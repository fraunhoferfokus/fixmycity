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
    $('#customsearch').live('pageinit', function() {
        console.log("=== pageinit for #customsearch");

        // more results button initially hidden
        $('#location_select').hide();

        // handle location flip switch
        $('#locationOnOff').live('change',
            function() {
                if($('#locationOnOff').val() === 'true') {
                    if(App.animations) {
                        $('#location_select').slideDown('slow');
                    } else {
                        $('#location_select').show();
                    }
                } else {
                    if(App.animations) {
                        $('#location_select').slideUp('slow');
                    } else {
                        $('#location_select').hide();
                    }
                    $('#latitude').val('');
                    $('#longitude').val('');
                }
            });

        // ensure that min rating <= max rating
        var min_slider = $('#minRating');
        var max_slider = $('#maxRating');

        min_slider.live('change', function() {
            if(min_slider.val() > max_slider.val()) {
                min_slider.val(max_slider.val()).slider("refresh");
            }
        });

        max_slider.live('change', function() {
            if(max_slider.val() < min_slider.val()) {
                max_slider.val(min_slider.val()).slider("refresh");
            }
        });

        // Fill category picker
        $.getJSON(App.RESOURCE_CATEGORIES, function(data) {
            var items = ['<option value="">Pick a category</option>'];

            $.each(data.objects, function(key, val) {
                items.push('<option value="' + val.id + '">' + val.title + '</option>');
            });

            $('#categoryId').html(items.join('\n'));
            $('#categoryId').selectmenu('refresh', true);
        });

        // Fill status picker
        $.getJSON(App.RESOURCE_STATUSES, function(data) {
            var items = ['<option value="">Pick a status</option>'];

            $.each(data.objects, function(key, val) {
                items.push('<option value="' + val.id + '">' + val.title + '</option>');
            });

            $('#statusId').html(items.join('\n'));
            $('#statusId').selectmenu('refresh', true);
        });

        $('#search_form').submit(function() {
            $('input#submit_search').button('disable');
        });
    });

    // PAGEBEFORESHOW
    $('#customsearch').live('pagebeforeshow', function() {
        console.log("=== pagebeforeshow for #customsearch");

        $('input#submit_search').button('enable');
    });
}).call(this);

