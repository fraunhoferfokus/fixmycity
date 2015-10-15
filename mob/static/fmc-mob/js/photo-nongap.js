
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
    var IMG_DIV         = '#img_preview'
      , IMG_PREVIEW_DIV = '#img_preview_div'
      , FILE_INPUT      = '#form_file_new';

    function changeInputFileStyle(formId, fileSelectId, fileInputId) {
        $('#' + fileSelectId).unbind('click');

        var fileInput = $('#' + fileInputId);
        fileInput.css({position: 'absolute', top: 0, right: 0,
                       opacity: 0.0, width: 0, height: 0, 'z-index': -10});

        $('#' + fileSelectId).bind('click', function() {
          fileInput.click()
        });
    }

    // dispay image selected in file input as preview
    function showImagePreview(file, imgdiv, imgpreviewdiv) {
        var reader = new FileReader();
        if(file.type.substr(0, 6) == 'image/') {
            // see: http://www.w3.org/TR/FileAPI/#dfn-filereader
            reader.onload = function(e) {
                imgdiv.attr('src', e.target.result);
                imgpreviewdiv.show();
            }
            reader.readAsDataURL(file);
        }
    }

    // file input listens for change event and previews image
    $(FILE_INPUT).live('change', function(e) {
        showImagePreview(e.target.files[0], $.ap(IMG_DIV), $.ap(IMG_PREVIEW_DIV));
    });

    changeInputFileStyle('photo_upload_form',
                         'form_select_new',
                         'form_file_new');
}).call(this);

