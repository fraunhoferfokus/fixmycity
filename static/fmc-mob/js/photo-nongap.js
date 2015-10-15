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
