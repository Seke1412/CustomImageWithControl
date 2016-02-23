(function($){
    'use strict'
    var editImage = function(_img, _options, _callback){
        var img, options, callback;

        //Check _img, _options, _callback validation
        // if _img is not valid return and exit;
        if (img == null || img == undefined){
            return {
                error:1,
                mess: "no image found"
            };
        }else{
            img = img;
        }
        //if user doesn't input _options, we will use a default options;
        if (_options == null || _options == undefined){
            options = {};
        }

        // if user doesn't provide callback => marked it as "none" we are free;
        if(_callback == null || _callback == undefined){
            callback = "none";
        }else{
            callback = _callback;
        }
    };

}(window));