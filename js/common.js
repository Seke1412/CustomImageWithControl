$(function(){
    'use strict';
    trace("document successfully init");

    var inputBtn = $("#file-input"),
        finishBtn = $("#finishBtn"),
        currentRot = 0,
        currentX = 0,
        currentY = 0,
        currentSX = 1,
        currentSY = 1,
        //editImage = $("#editIMG"),
        alert = $(".alert"),
        currentFile,
        customImage,
        init = function(){
            inputBtn.on("change", onSelectImageComplete);
            finishBtn.on("click", onClickFinish);
        },
        onSelectImageComplete = function(e){
            e.preventDefault();
            var target = e.target,
                file = target && target.files && target.files[0],
                options = {
                    //maxWidth: originalImage.width(),
                    canvas: true
                };
            if (!file) {
                return;
            }
            loadImage.parseMetaData(file, function (data) {
                if (data.exif) {
                    options.orientation = data.exif.get('Orientation');
                    //displayExifData(data.exif);
                }
                doLoadImage(file, options);
            });
        },
        doLoadImage = function(_file, _options){
            trace("doLoadedImage trigger success");
            currentFile = _file;
            if (!loadImage(_file, showLoadedImage, _options)) {
                alert.html("Your browser does not support the URL or FileReader API.");
            }
        },
        showLoadedImage = function(img){
            var originalImage = document.getElementById("originalIMG");
            trace("showLoadedImage trigger success");
            if (!(img.src || img instanceof HTMLCanvasElement)) {
                alert.html("Loading image file failed");
            } else {
                originalImage.src = img.toDataURL();
                //create editimage;
                customImage = editImage(originalImage,{},finishCreateEditImage).res;
                trace(customImage);
            }

        },
        finishCreateEditImage = function(){
            trace("finish create edit image");
        },
        onClickFinish = function(e){
            trace("finish click");
            customImage.toggleController();
        };
    init();


})

var trace = function(s){
    console.log(s);
}

