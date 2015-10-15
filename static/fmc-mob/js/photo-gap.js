(function() {
    var IMG_DIV         = '#img_preview'
      , IMG_PREVIEW_DIV = '#img_preview_div'
      , FILE_INPUT      = '#pgPath_new'
      , BUTTON_PHOTO    = '#takePhoto'
      , BUTTON_GALLERY  = '#pickPhoto'
      , cam             = navigator.camera;

    // Called when a photo is successfully retrieved
    function onPhotoURISuccess(imageURI) {
        // Unhide image elements & show photo
        if(device.platform === "WinCE") {
            $(IMG_DIV).attr('src', "x-wmapp1:" + imageURI);
        } else {
            $(IMG_DIV).attr('src', imageURI);
        }
        $(FILE_INPUT).val(imageURI); // set hidden field
        $(IMG_PREVIEW_DIV).show();
    }

    function getPhoto(source) {
        // get/pick picture and retrieve image URI
        var cam = navigator.camera;
        cam.getPicture(onPhotoURISuccess, onFail, {
            quality: 50,
            destinationType: cam.DestinationType.FILE_URI,
            mediaType: cam.MediaType.PICTURE,
            sourceType: source,
            encodingType: cam.EncodingType.JPEG,
            allowEdit: false,
            targetWidth: 640,
            targetHeight: 480
        });
    }

    function onFail(message) {
        navigator.notification.alert('Capture error: ' + message, null, 'Stay calm');
    }

    // file input listens for change event and previews image
    $(BUTTON_PHOTO).click(function() {
        var cam  = navigator.camera;
        getPhoto(cam.PictureSourceType.CAMERA);
    });

    $(BUTTON_GALLERY).click(function() {
        // TODO: What is the difference to
        // Camera.PictureSourceType.SAVEDPHOTOALBUM on non-Android devices?
        var cam  = navigator.camera;
        getPhoto(cam.PictureSourceType.PHOTOLIBRARY);
    });
}).call(this);
