(function($){
    'use strict';
    var currentControl = "none",
        currentScale = 1,
        startPos = {x:0,y:0},
        initPos = {x:0,y:0},
        translatedPos = {x:0,y:0},
        pivot = {x:0,y:0},
        startAngle = {rad:0, deg:0},
        movingAngle = {rad:0, deg:0},
        movedAngle = 0,
        angleToRotate = 0,
        controlRadius = 16,
        controlHolder,
        controlCanvas,
        controlInitPos = {x:0, y:0},

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

            editImage.initControl(img);

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
        getElementPos = function(element){
            //var element = document.getElementById(elementID);
            var rect = element.getBoundingClientRect();
            var elementLeft,elementTop; //x and y
            var scrollTop = document.documentElement.scrollTop?
                document.documentElement.scrollTop:document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft?
                document.documentElement.scrollLeft:document.body.scrollLeft;
            elementTop = rect.top+scrollTop;
            elementLeft = rect.left+scrollLeft;
            return {x:elementLeft, y:elementTop};
        },
        getAngleFromPoint = function(p0, p1){
            var dx = p1.x - p0.x;
            var dy = p1.y - p0.y;
            var d = Math.sqrt(dx*dx + dy*dy);

            var angleInRad = Math.atan2(dy,dx);//dy/d;
            var angleInDeg = angleInRad*180/Math.PI;

            return {rad:angleInRad, deg:angleInDeg};
        },
        updateTransform = function(_rotate, _scale, xx, yy){
            controlHolder.style.transform = "rotate("+ _rotate +"deg) scale("+_scale+") translate(" +xx +"px,"+yy +"px)";
            controlHolder.style.mozTransform = "rotate("+ _rotate +"deg) scale("+_scale+") translate(" +xx +"px,"+yy +"px)";
            controlHolder.style.webkitTransform = "rotate("+ _rotate +"deg) scale("+_scale+") translate(" +xx +"px,"+yy +"px)";
        };

    editImage.initControl = function(img){
        trace("start init control");

        trace(img.clientWidth +" = === == = "+ img.clientHeight);

        controlHolder = document.createElement("div");
        controlHolder.style.position = "absolute";
        controlHolder.style.display = "block";
        controlHolder.style.backgroundColor = "rgba(0,255,255,1)";

        document.body.appendChild(controlHolder);

        //create a canvas and draw all needed control point to it;
        controlCanvas = document.createElement("canvas");
        controlCanvas.setAttribute("id", "controlHolderCanvas");
        controlCanvas.style.userSelect = "none";
        controlCanvas.style.mozUserSelect = "none";
        controlCanvas.style.webkitUserSelect = "none";
        controlCanvas.style.backgroundColor = "rgba(0,255,0,0.5)";



        controlCanvas.style.position = "absolute";
        controlCanvas.width = img.clientWidth;
        controlCanvas.height = img.clientHeight;

        //*** Consider this zIndex ***px
        controlCanvas.style.zIndex = 1;

        //get context from canvas;
        var ctx = controlCanvas.getContext('2d');
        ctx.drawImage(img,0,0);



        controlHolder.appendChild(controlCanvas);

        controlHolder.style.width = controlCanvas.width + "px";
        controlHolder.style.height = controlCanvas.height + "px";
        controlHolder.style.transformOrigin = "50% 50%";
        controlHolder.style.mozTransformOrigin = "50% 50%";
        controlHolder.style.webkitTransformOrigin = "50% 50%";

        // create control point lay on top of canvas;
        var TL = document.createElement("div"),
            BR = document.createElement("div");

        var controlArray = [TL, BR],
            controlNameArray = ['TL', 'BR'];

        for(var i = 0 ; i<controlArray.length; i++){
            var item = controlArray[i];
            item.style.position = "absolute";

            item.style.width = controlRadius + "px";
            item.style.height = controlRadius + "px";
            if(i == 0){
                item.style.backgroundColor = "#ff0000";
                item.style.top = -controlRadius/2 + "px";
                item.style.right = "0";
                item.style.bottom = "0";
                item.style.left = -controlRadius/2 + "px";
            }else{
                item.style.top = (controlCanvas.height - controlRadius/2) + "px";
                item.style.right = "0";
                item.style.bottom = "0";
                item.style.left = (controlCanvas.width - controlRadius/2) + "px";
                item.style.backgroundColor = "#00ff00";
            }

            item.style.display = "block";
            item.style.zIndex = 2;
            item.style.border = "0px solid #ff0000";
            item.style.borderRadius = controlRadius/2 + "px";

            item.setAttribute("control-name", controlNameArray[i]);
            item.addEventListener("mouseover", controlMouseOver);
            item.addEventListener("mouseout", controlMouseOut);
            controlHolder.appendChild(item);
        }


        controlHolder.addEventListener("mouseover", holderMouseOver);
        controlHolder.addEventListener("mouseout", holderMouseOut);

        function holderMouseOver(e){
            e.stopPropagation();
            e.preventDefault();
            trace("holderMouseOver");
            startPos = getElementPos(e.target);
            trace("startPos.x: " +  startPos.x + " ---- startPos.y: " +  startPos.y);
            $.addEventListener("mousedown", stageMouseDown);
            currentControl = "move";
        }

        function holderMouseOut(e){
            e.stopPropagation();
            e.preventDefault();
            trace("holderMouseOut");
            $.removeEventListener("mousedown", stageMouseDown);

        }

        function controlMouseOver(e){
            e.stopPropagation();
            e.preventDefault();
            var target = e.target;
            var targetName = target.getAttribute("control-name");
            trace("mouse over: " + targetName);
            if(targetName == "TL"){
                currentControl = "rotate";
            }

            if(targetName == "BR"){
                currentControl = "scale";
            }



            $.addEventListener("mousedown", stageMouseDown);

        }

        function controlMouseOut(e){
            e.stopPropagation();
            e.preventDefault();

            var target = e.target;
            var targetName = target.getAttribute("control-name");
            trace("mouse out: " + targetName);

            $.removeEventListener("mousedown", stageMouseDown);
        }

        function stageMouseDown(e){

            e.stopPropagation();
            var target = e.target;

            if(currentControl == "move"){
                initPos = getMousePosByMouseEvent(e);
                trace("initPos.x: " + initPos.x + " === "+ "initPos.y: " + initPos.y);
            }else{

                var tl = getElementPos(TL);
                var br = getElementPos(BR);
                pivot = {x:(tl.x + br.x)/2, y:(tl.y + br.y)/2};

                controlInitPos = getMousePosByMouseEvent(e);

                if(currentControl == "rotate"){
                    startAngle = getAngleFromPoint(pivot, controlInitPos);
                    trace("pivot.x : " + pivot.x + " === " + "pivot.y : " + pivot.y);
                    trace("p1.x : " + controlInitPos.x + " === " + "p1.y : " + controlInitPos.y);
                    trace("testAngle.rad: " + startAngle.rad + " === " + "testAngle.deg : " + startAngle.deg);

                }

                if(currentControl == "scale") {

                }

            }


            $.addEventListener("mousemove", stageMouseMove);
            $.addEventListener("mouseup", stageMouseUp);
        }

        function stageMouseMove(e){
            e.stopPropagation();


            var mousePos = getMousePosByMouseEvent(e);

            if(currentControl == "move"){
                var xx = mousePos.x - initPos.x;
                var yy = mousePos.y - initPos.y;
                updateTransform(movedAngle, currentScale, translatedPos.x + xx, translatedPos.y + yy);
            }


            if(currentControl == "rotate"){
                movingAngle = getAngleFromPoint(pivot, mousePos);
                trace("movingAngle.rad: " + movingAngle.rad + " === " + "movingAngle.deg : " + movingAngle.deg );
                angleToRotate = movingAngle.deg - startAngle.deg;
                //updateTransformRotate(movedAngle + angleToRotate);
                updateTransform(movedAngle + angleToRotate, currentScale, translatedPos.x, translatedPos.y);
            }
            if(currentControl == "scale"){
                var dxInit = controlInitPos.x - pivot.x;
                var dyInit = controlInitPos.y - pivot.y;
                var dInit = Math.sqrt(dxInit*dxInit + dyInit*dyInit);

                var dxMouse = mousePos.x - pivot.x;
                var dyMouse = mousePos.y - pivot.y;
                var dMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);

                var d = dMouse-dInit;

                //var dir = (dMouse > dInit) ? 1 : -1;
                var dscale = (d/100);
                trace("distance for scale: " + dscale);
                //updateTransformScale(currentScale + dscale);
                updateTransform(movedAngle, currentScale + dscale, translatedPos.x, translatedPos.y);
            }


        }

        function stageMouseUp(e){
            e.stopPropagation();

            $.removeEventListener("mousemove", stageMouseMove);
            $.removeEventListener("mousedown", stageMouseDown);

            var mousePos = getMousePosByMouseEvent(e);


            if(currentControl == "rotate") {
                movedAngle += movingAngle.deg - startAngle.deg;
            }
            if(currentControl == "scale") {


                var dxInit = controlInitPos.x - pivot.x;
                var dyInit = controlInitPos.y - pivot.y;
                var dInit = Math.sqrt(dxInit*dxInit + dyInit*dyInit);

                var dxMouse = mousePos.x - pivot.x;
                var dyMouse = mousePos.y - pivot.y;
                var dMouse = Math.sqrt(dxMouse*dxMouse + dyMouse*dyMouse);

                var d = dMouse-dInit;

                var dscale = d/100;
                currentScale += dscale;
            }


            if(currentControl == "move"){

                var xx = mousePos.x - initPos.x;
                var yy = mousePos.y - initPos.y;
                translatedPos.x = xx;
                translatedPos.y = yy;

                //startPos.x = xx;
                //startPos.y = yy;

            }

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