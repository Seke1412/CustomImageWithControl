(function($){
    'use strict';
    var currentControl = "none",
        isMoving = false,
        initPos = {x:0, y:0},
        editImage = function(_img, _options, _callback){

            var img, options, callback;

            //Check _img, _options, _callback validation
            // if _img is not valid return and exit;
            if (_img == null || _img == undefined){
                return {
                    error:1,
                    mess: "no image found"
                };
            }else{
                img = _img;
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

            editImage.initControl();

            trace(callback);

            if(callback != "none"){
                callback();
            }

            return {
                error:0,
                mess: "success"
            }
        },
        getMousePosByMouseEvent = function(e){

            var x, y;

            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            //x -= element.offsetLeft;
            //y -= element.offsetTop;
            if(x < 0){
                x = 0;
            }
            if(y < 0){
                y = 0;
            }

            return {x:x,y:y};
        },
        updateTransform = function(){
            trace("transform updating....");
        };

    editImage.initControl = function(){
        trace("start init control");

        var controlHolder = document.createElement("div");
        controlHolder.style.position = "relative";
        document.body.appendChild(controlHolder);

        //create a canvas and draw all needed control point to it;
        var controlCanvas = document.createElement("canvas");
        controlCanvas.setAttribute("id", "controlHolderCanvas");
        controlCanvas.style.userSelect = "none";
        controlCanvas.style.mozUserSelect = "none";
        controlCanvas.style.webkitUserSelect = "none";
        //controlCanvas.style.backgroundColor = "rgba(0,0,0,0)";

        controlCanvas.style.position = "absolute";

        //*** Consider this zIndex ***
        controlCanvas.style.zIndex = 1;

        //get context from canvas;
        var ctx = controlCanvas.getContext('2d');

        controlHolder.appendChild(controlCanvas);


        // create control point lay on top of canvas;
        var TL = document.createElement("div"),
            BR = document.createElement("div");

        var controlArray = [TL, BR],
            controlNameArray = ['TL', 'BR'];

        for(var i = 0 ; i<controlArray.length; i++){
            var item = controlArray[i];
            item.style.position = "absolute";
            item.style.backgroundColor = "#ff0000";
            item.style.width = "16px";
            item.style.height = "16px";
            if(i == 0){
                item.style.top = -8 + "px";
                item.style.right = "0";
                item.style.bottom = "0";
                item.style.left = -8 + "px";
            }else{
                item.style.top = (controlCanvas.height - 8) + "px";
                item.style.right = "0";
                item.style.bottom = "0";
                item.style.left = (controlCanvas.width - 8) + "px";
            }

            item.style.display = "block";
            item.style.zIndex = 2;
            item.style.border = "0px solid #ff0000";
            item.style.borderRadius = "8px";

            item.setAttribute("control-name", controlNameArray[i]);
            item.addEventListener("mouseover", controlMouseOver);
            item.addEventListener("mouseout", controlMouseOut);
            controlHolder.appendChild(item);
        }


        function controlMouseOver(e){
            var target = e.target;
            var targetName = target.getAttribute("control-name");
            trace("mouse over: " + targetName);
            $.addEventListener("mousedown", stageMouseDown);

        }

        function controlMouseOut(e){
            var target = e.target;
            var targetName = target.getAttribute("control-name");
            trace("mouse out: " + targetName);
            $.removeEventListener("mousedown", stageMouseDown);
        }

        function stageMouseDown(e){
            e.stopPropagation();
            var target = e.target;
            var targetName = target.getAttribute("control-name");

            trace("mouse down: " + targetName);

            initPos = getMousePosByMouseEvent(e);


            $.addEventListener("mousemove", stageMouseMove)
            $.addEventListener("mouseup", stageMouseUp);
        }

        function stageMouseMove(e){
            e.stopPropagation();
            trace("stage mouse is moving...");
            var mousePos = getMousePosByMouseEvent(e);
            trace("mousePos: " + mousePos.x + " === "+ mousePos.y);

            var dx = mousePos.x - initPos.x;
            var dy = mousePos.y - initPos.y;
            trace("d: " + dx + " === "+ dy);
            //updateTransform();
        }

        function stageMouseUp(e){
            e.stopPropagation();
            $.removeEventListener("mousemove", stageMouseMove);
            $.removeEventListener("mousedown", stageMouseDown);
        }

        trace("success init edit image control");
    };




    //make editImage global var
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return editImage;
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = editImage;
    } else {
        $.editImage = editImage;
    }

}(window));