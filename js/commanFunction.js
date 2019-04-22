

function countAngle(theta){
    if (theta < 0.0) {
        theta += 360.0;
    }
    if (theta > 90 && theta <= 180) {
        theta = 180 - theta;
    }
    else if (theta > 180 && theta <= 270) {
         theta = theta - 180;
    }
    else if (theta > 270 && theta <= 360) {
       theta = 360 - theta;
    }
    else if (theta > 360) {
       theta = theta - 360;
    }
    return theta;
}
// Vector functions
function v_vector(x, y) {
    return { x : x, y : y }
}
function v_vector2(mag, dir) {
    return v_vector(mag * Math.sin(dir), mag * Math.cos(dir));
}
function v_add(v1, v2) {
    return v_vector(v1.x + v2.x, v1.y + v2.y);
}
function v_scale(v, s) {
    return v_vector(v.x * s, v.y * s);
}
function v_displace(point, angle, distance) {
    return v_add(point, v_vector2(distance, angle));
}

// Fabric.js functions
function getLocation(obj) {
    return v_vector(obj.left,obj.top);
}
function setLocation(obj, dispacement) {
    obj.left = dispacement.x;
    obj.top = dispacement.y;
}
function rotateText(line){
    var angle = line.getAngle() % 360;
    var centerPoint = getLocation(line);
    var antiAngle = -angle * Math.PI / 180;
    var distanceToTop = line.height * line.scaleY / 2;
    var textOffset = 5;
    var distance = -1 * (distanceToTop + textOffset);
    var displacement = v_displace(centerPoint, antiAngle, distance);
    var textDimensions = v_vector(line.lineText.width, line.lineText.height);
    var textLocation = v_add(displacement, v_scale(textDimensions, -0.5));
    setLocation(line.lineText, textLocation);
}
function getCurrentAngle(e){
    var newAngle;
    var currentAngle = parseInt(e.target.getAngle());
    startAngle = parseInt(e.target.startAngle);
    if (currentAngle > 180) {
        newAngle = startAngle - (360 - currentAngle);
    }
    else if (180 == (currentAngle+startAngle)) {
        newAngle = 180;
    }
    else if (currentAngle <= 180 && 180 >= (currentAngle+startAngle)) {
        newAngle = startAngle + currentAngle;
    }
    else if (currentAngle <= 180 && 180 < (currentAngle+startAngle)) {
        newAngle = startAngle + currentAngle - 360;
    }
    return newAngle;
}


var canvas = new fabric.Canvas("video-canvas", {selection: false});
var canvas1 = new fabric.Canvas("video-canvas1", {selection: false});
var circle, isDown, origX, origY, isDownAngle;
var freeDrawing = true;
var isLineDrawing = isCircleDrawing = isAngleDrawing = "0";
$('.canvas-container').css('z-index', '1000');
$('.main_sidebar').css('z-index', '1001');

//Clear Canvas
$('#clear-canvas').on('click', function (event) {
    event.preventDefault();
    canvas.clear();
});

function preventLeaving(e) {
    var activeObject = e.target;
    if ((activeObject.get('left') - (activeObject.get('width') * activeObject.get('scaleX') / 2) < 0))
        activeObject.set('left', activeObject.get('width') * activeObject.get('scaleX') / 2);
    if ((activeObject.get('top') - (activeObject.get('height') * activeObject.get('scaleY') / 2) < 0))
        activeObject.set('top', activeObject.get('height') * activeObject.get('scaleY') / 2);
    if (activeObject.get('left') + (activeObject.get('width') * activeObject.get('scaleX') / 2) > canvas.getWidth())
    {
        var positionX = canvas.getWidth() - (activeObject.get('width') * activeObject.get('scaleX')) / 2;
        activeObject.set('left', positionX > canvas.getWidth() / 2 ? positionX : canvas.getWidth() / 2);
    }
    if (activeObject.get('top') + (activeObject.get('height') * activeObject.get('scaleY') / 2) > canvas.getHeight())
    {
        var positionY = canvas.getHeight() - (activeObject.get('height') * activeObject.get('scaleY') / 2);
        activeObject.set('top', positionY > canvas.getHeight() / 2 ? positionY : canvas.getHeight() / 2);
    }

    //below just prevention for object from getting width or height greater than canvas width and height
    if (activeObject.get('width') * activeObject.get('scaleX') > canvas.getWidth())
    {
        activeObject.set('scaleX', canvas.getWidth() / activeObject.get('width'));
    }
    if (activeObject.get('height') * activeObject.get('scaleY') > canvas.getHeight())
    {
        activeObject.set('scaleY', canvas.getHeight() / activeObject.get('height'));
    }
}
function preventLeaving1(e){
    console.log(e);
}
canvas.observe('object:moving', preventLeaving);
canvas.observe('object:scaling', preventLeaving);

canvas1.observe('object:moving', preventLeaving1);
canvas1.observe('object:scaling', preventLeaving1);

$(document).on('click', '.line-drawing-tools', function (event) {
    event.preventDefault();
    //return false;
    isLineDrawing = "0";
    isCircleDrawing = "0";
    isAngleDrawing = "0";

    if ($(this).hasClass('active')) {
        $(".line-drawing-tools").removeClass('active');
    }
    else {
        var btnValue = $(this).data("value") || "";
        if (btnValue != "") {
            if (btnValue == "circle") {
                isCircleDrawing = "1";
                drawCircle();
            }
            else if (btnValue == "line") {
                isLineDrawing = "1";
                drawLine();
            }
            else if (btnValue == "angle") {
                isAngleDrawing = "1";
                drawAngle();
            }
            else if (btnValue == "move") {
                changeDrawing();
            }
        }
        $(".line-drawing-tools").removeClass('active');
        $(this).addClass('active');
    }
    if ($(this).data("value") == "delete") {
        deleteObjects();
    }
    if ($(this).data("value") == "clear") {
        canvas.clear();
        canvas1.clear();
    }
});

function changeDrawing() {
    canvas.isDrawingMode = false;
    canvas.selection = true;
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    canvas.forEachObject(function (o) {
        o.cornerSize = 6;
        o.setCoords()
    })

    canvas1.isDrawingMode = false;
    canvas1.selection = true;
    canvas1.off('mouse:down');
    canvas1.off('mouse:move');
    canvas1.off('mouse:up');
    canvas1.forEachObject(function (o) {
        o.cornerSize = 6;
        o.setCoords()
    })
}

function drawLine() {
    canvas.on('mouse:down', function (o) {
        if (isLineDrawing == "1") {
            canvas.selection = false;
            isDown = true;
            var pointer = canvas.getPointer(o.e);
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'yellow',
                stroke: 'yellow',
                originX: 'center',
                originY: 'center'
            });
            canvas.add(line);
        }
    });

    canvas.on('mouse:move', function (o) {
        if (!isDown)
            return;
        if (isLineDrawing == "1") {
            var pointer = canvas.getPointer(o.e);
            line.set({x2: pointer.x, y2: pointer.y});
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', function (o) {
        isDown = false;
    });

    canvas1.on('mouse:down', function (o) {
        if (isLineDrawing == "1") {
            canvas1.selection = false;
            isDown = true;
            var pointer = canvas1.getPointer(o.e);
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'yellow',
                stroke: 'yellow',
                originX: 'center',
                originY: 'center'
            });
            canvas1.add(line);
        }
    });

    canvas1.on('mouse:move', function (o) {
        if (!isDown)
            return;
        if (isLineDrawing == "1") {
            var pointer = canvas1.getPointer(o.e);
            line.set({x2: pointer.x, y2: pointer.y});
            canvas1.renderAll();
        }
    });

    canvas1.on('mouse:up', function (o) {
        isDown = false;
    });
}

function drawCircle() {
    canvas.on('mouse:down', function (o) {
        if (isCircleDrawing == "1") {
            isDown = true;
            canvas.selection = false;
            var pointer = canvas.getPointer(o.e);
            origX = pointer.x;
            origY = pointer.y;
            circle = new fabric.Circle({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                radius: pointer.x - origX,
                angle: 0,
                fill: '',
                stroke: 'blue',
                strokeWidth: 2,
            });
            canvas.add(circle);
        }
    });

    canvas.on('mouse:move', function (o) {
        if (isCircleDrawing == "1") {
            if (!isDown)
                return;
            var pointer = canvas.getPointer(o.e);

            var radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;
            if (radius > circle.strokeWidth) {
                radius -= circle.strokeWidth / 2;
            }
            circle.set({radius: radius});

            if (origX > pointer.x) {
                circle.set({originX: 'right'});
            } else {
                circle.set({originX: 'left'});
            }
            if (origY > pointer.y) {
                circle.set({originY: 'bottom'});
            } else {
                circle.set({originY: 'top'});
            }
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', function (o) {
        isDown = false;
    });

    canvas1.on('mouse:down', function (o) {
        if (isCircleDrawing == "1") {
            isDown = true;
            canvas1.selection = false;
            var pointer = canvas1.getPointer(o.e);
            origX = pointer.x;
            origY = pointer.y;
            circle = new fabric.Circle({
                left: origX,
                top: origY,
                originX: 'left',
                originY: 'top',
                radius: pointer.x - origX,
                angle: 0,
                fill: '',
                stroke: 'blue',
                strokeWidth: 2,
            });
            canvas1.add(circle);
        }
    });

    canvas1.on('mouse:move', function (o) {
        if (isCircleDrawing == "1") {
            if (!isDown)
                return;
            var pointer = canvas1.getPointer(o.e);
            var radius = Math.max(Math.abs(origY - pointer.y), Math.abs(origX - pointer.x)) / 2;
            if (radius > circle.strokeWidth) {
                radius -= circle.strokeWidth / 2;
            }
            circle.set({radius: radius});

            if (origX > pointer.x) {
                circle.set({originX: 'right'});
            } else {
                circle.set({originX: 'left'});
            }
            if (origY > pointer.y) {
                circle.set({originY: 'bottom'});
            } else {
                circle.set({originY: 'top'});
            }
            canvas1.renderAll();
        }
    });

    canvas1.on('mouse:up', function (o) {
        isDown = false;
    });

}
var startAngle;
var startAngle1;
function drawAngle() {
    canvas.on('mouse:down', function (o) {
        if (isAngleDrawing == "1") {
            canvas.selection = false;
            isDownAngle = true;
            var pointer = canvas.getPointer(o.e);
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'red',
                stroke: 'red',
                originX: 'center',
                originY: 'center'
            });
            line.line1 = line;
            canvas.add(line);
        }
    });

    canvas.on('mouse:move', function (o) {
        if (!isDownAngle)
            return;
        if (isAngleDrawing == "1") {
            var pointer = canvas.getPointer(o.e);
            line.set({x2: pointer.x, y2: pointer.y});
            canvas.renderAll();
        }
    });

    canvas.on('mouse:up', function (o) {
        if (isAngleDrawing == "1") {
            y11 = line.get('y1');
            y12 = line.get('y2');
            x11 = line.get('x1');
            x12 = line.get('x2');
            var dy = y12 - y11;
            var dx = x12 - x11;
            var theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI;
            line.startAngle = theta;
            var angle = countAngle(theta);
            var angl = parseInt(angle).toString() +'°';
            var top = line.top
            var left = line.left;
            if((theta >45 && theta < 75) || (theta >-180 && theta < -165)){
                left += 11;
            }
            if((theta >76 && theta < 90) || (theta >-166 && theta < -145)){
                left += 08;
            }
            if((theta >0 && theta < 46) || (theta >-146 && theta < -90)){
                left += 20;
            }
            var text1 = new fabric.Text(angl, {
                fontSize: 25,
                fontFamily: 'Georgia', top: top, left:left,
                fill: 'red'
            });
            line.lineText = text1;
            canvas.add(text1);
            isDownAngle = false;
            rotateText(line);
        }
    });
    canvas.on('object:rotating', function (e) {
        if(typeof e.target.lineText != "undefined"){
            var newAngle = getCurrentAngle(e);
            var theta = countAngle(newAngle);
            theta = parseInt(theta).toString() +'°';
            e.target.lineText.setText(theta);
            rotateText(e.target);
        }
    });

    //draw angel in canvas 2

    canvas1.on('mouse:down', function (o) {
        if (isAngleDrawing == "1") {
            canvas1.selection = false;
            isDownAngle = true;
            var pointer = canvas1.getPointer(o.e);
            var points = [pointer.x, pointer.y, pointer.x, pointer.y];

            line2 = new fabric.Line(points, {
                strokeWidth: 2,
                fill: 'red',
                stroke: 'red',
                originX: 'center',
                originY: 'center'
            });
            line2.line1 = line2;
            canvas1.add(line2);
        }
    });

    canvas1.on('mouse:move', function (o) {
        if (!isDownAngle)
            return;
        if (isAngleDrawing == "1") {
            var pointer = canvas1.getPointer(o.e);
            line2.set({x2: pointer.x, y2: pointer.y});
            canvas1.renderAll();
        }
    });
    canvas1.on('mouse:up', function (o) {

        if (isAngleDrawing == "1") {
            y11 = line2.get('y1');
            y12 = line2.get('y2');
            x11 = line2.get('x1');
            x12 = line2.get('x2');
            var dy = y12 - y11;
            var dx = x12 - x11;
            var theta = Math.atan2(dy, dx); // range (-PI, PI]
            theta *= 180 / Math.PI;
            line2.startAngle = theta;
            var angle = countAngle(theta);
            var angl = parseInt(angle).toString() +'°';
            var top = line2.top
            var left = line2.left;
            if((theta >45 && theta < 75) || (theta >-180 && theta < -165)){
                left += 11;
            }
            if((theta >76 && theta < 90) || (theta >-166 && theta < -145)){
                left += 08;
            }
            if((theta >0 && theta < 46) || (theta >-146 && theta < -90)){
                left += 20;
            }
            var text2 = new fabric.Text(angl, {
                fontSize: 25,
                fontFamily: 'Georgia', top: top, left:left,
                fill: 'red'
            });
            line2.lineText = text2;
            canvas1.add(text2);
            isDownAngle = false;
            rotateText(line2);
        }
    });
    canvas1.on('object:rotating', function (e) {
        if(typeof e.target.lineText != "undefined"){
            var newAngle = getCurrentAngle(e);
            var theta = countAngle(newAngle);
            theta = parseInt(theta).toString() +'°';
            e.target.lineText.setText(theta);
            rotateText(e.target);
        }
    });
}

function createTriangle(left, top, line1, line2, line3, line4) {
    var c = new fabric.Triangle({
        left: left,
        top: top,
        strokeWidth: 3,
        fill: 'black',
        stroke: 'black',
        angle: -180,
        width: 5,
        height: 5
    });
    c.hasControls = c.hasBorders = false;

    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;
    c.line4 = line4;

    return c;
}

function makeLineForTriangle(coords) {
    return new fabric.Line(coords, {
        fill: 'red',
        stroke: 'red',
        strokeWidth: 2,
        selectable: false
    });
}

// select all objects
function deleteObjects() {
    var activeObject = canvas.getActiveObject(),
        activeGroup = canvas.getActiveGroup();
    if (activeObject) {
        canvas.remove(activeObject);
    }
    else if (activeGroup) {
        var objectsInGroup = activeGroup.getObjects();
        canvas.discardActiveGroup();
        objectsInGroup.forEach(function (object) {
            canvas.remove(object);
        });
    }

    var activeObject1 = canvas1.getActiveObject(),
        activeGroup1 = canvas1.getActiveGroup();
    if (activeObject1) {
        canvas1.remove(activeObject1);
    }
    else if (activeGroup1) {
        var objectsInGroup1 = activeGroup1.getObjects();
        canvas1.discardActiveGroup();
        objectsInGroup1.forEach(function (object) {
            canvas1.remove(object);
        });
    }
}

jQuery(document).ready(function($) {
    
var player = videojs("sidebyside-video_1").ready(function() {
    var myPlayer = this, id = myPlayer.id();
    //var aspectRatio = 1;
    var aspectRatio = 300/640;


    function resizeVideoJS(){
        var controlsHeight = 30;
        var width = document.getElementById(id).parentElement.offsetWidth;
        var height = document.getElementById(id).parentElement.offsetHeight;
        aspectRatio = height/width;
        //myPlayer.width(width).height( width * aspectRatio );
        $("#video-canvas").width(width).height( width * aspectRatio -controlsHeight);
        $("#video-canvas").next(".upper-canvas").width(width).height( width * aspectRatio -controlsHeight);
        $("#video-canvas").next(".canvas-container").width(width).height( width * aspectRatio - controlsHeight );

    }
    resizeVideoJS();
    window.onresize = resizeVideoJS;
});

var otherPlayer = videojs("sidebyside-video_2").ready(function() {
var myPlayer = this, id = myPlayer.id();
var aspectRatio = 300/640;

function resizeVideoJS(){
    var controlsHeight = 30;
    var width = document.getElementById(id).parentElement.offsetWidth;
    var height = document.getElementById(id).parentElement.offsetHeight;
    aspectRatio = height/width;
//              alert("height : "+height+"width : "+width);
//              alert(width/height)
//              myPlayer.width(width).height( width * aspectRatio );
    $("#video-canvas1").width(width).height( width * aspectRatio -controlsHeight);
    $("#video-canvas1").next(".upper-canvas").width(width).height( width * aspectRatio -controlsHeight);
    $("#video-canvas1").next(".canvas-container").width(width).height( width * aspectRatio - controlsHeight );
    //myPlayer.width(width).height( width * aspectRatio );
}
resizeVideoJS();
window.onresize = resizeVideoJS;
});

player.bigPlayButton.hide();
otherPlayer.bigPlayButton.hide();

var isVideo1Playing = 0;
var isVideo2Playing = 0;

$(".action-on-both").click(function(event) {
var action = $(".action-on-both").data("action") || "play";

if(action == "play") {
    playVideo("both");
    $(".action-on-both").data("action", "pause").text("Pause Both");
}
else {
    pauseVideo("both");
    $(".action-on-both").data("action", "play").text("Play Both");
}
});
$(".playVideoLeftBtn").click(function(event) {
var action = $(this).data("action") || "play";
if(action == "play") {
    playVideo("video1");
}
else {
    pauseVideo("video1");
}
});
$(".video1PlayImage").click(function(event) {
playVideo("video1");
});
$(".playVideoRightBtn").click(function(event) {
var action = $(this).data("action") || "play";
if(action == "play") {
    playVideo("video2");
}
else {
    pauseVideo("video2");
}
});
$(".video2PlayImage").click(function(event) {
playVideo("video2");
});

player.on('play', function() {
playVideo("video1");
});


otherPlayer.on('play', function() {
playVideo("video2");
});

player.on('pause', function() {
pauseVideo("video1");
});
otherPlayer.on('pause', function() {
pauseVideo("video2");
});

function playVideo(videosForPlay) {
if(videosForPlay == "video1") {
    isVideo1Playing = 1;
    $(".play-both").removeClass('hide');
    $(".pause-both").addClass('hide');
    $(".video1PlayImage").addClass('hide');
    player.play();
    $(".playVideoLeftBtn").data("action", "pause").text("Pause Left")
}
else if(videosForPlay == "video2") {
    isVideo2Playing = 1;
    $(".play-both").removeClass('hide');
    $(".pause-both").addClass('hide');
    $(".video2PlayImage").addClass('hide');
    otherPlayer.play();
    $(".playVideoRightBtn").data("action", "pause").text("Pause Right")
}
else {
    isVideo1Playing = 1;
    isVideo2Playing = 1;

    $(".pause-both").removeClass('hide');
    $(".play-both").addClass('hide');
    $(".video1PlayImage").addClass('hide');
    $(".video2PlayImage").addClass('hide');
    player.play();
    otherPlayer.play();
    $(".playVideoLeftBtn").data("action", "pause").text("Pause Left")
    $(".playVideoRightBtn").data("action", "pause").text("Pause Right")
}

changeVideosActionButton()
}

function pauseVideo(videosForPause) {
if(videosForPause == "video1") {
    isVideo1Playing = 0;
    $(".play-both").removeClass('hide');
    $(".pause-both").addClass('hide');
    $(".video1PlayImage").removeClass('hide');
    player.pause();
    $(".playVideoLeftBtn").data("action", "play").text("Play Left");
}
else if(videosForPause == "video2") {
    isVideo2Playing = 0;
    $(".play-both").removeClass('hide');
    $(".pause-both").addClass('hide');
    $(".video2PlayImage").removeClass('hide');
    otherPlayer.pause();
    $(".playVideoRightBtn").data("action", "play").text("Play Right");
}
else {
    isVideo1Playing = 0;
    isVideo2Playing = 0;
    $(".pause-both").addClass('hide');
    $(".play-both").removeClass('hide');
    $(".video1PlayImage").removeClass('hide');
    $(".video2PlayImage").removeClass('hide');
    player.pause();
    otherPlayer.pause();
    $(".playVideoLeftBtn").data("action", "play").text("Play Left");
    $(".playVideoRightBtn").data("action", "play").text("Play Right");
}

changeVideosActionButton();
}

function changeVideosActionButton() {
if(isVideo1Playing == 1 && isVideo2Playing == 1) {
    $(".action-on-both").data("action", "pause").text("Pause Both");
}
else {
    $(".action-on-both").data("action", "play").text("Play Both");
}
}

//Time for forward or Backword video
var changeDurationTime = 5; //Forword or Backword times for Video

$(document).on('click', '.both-forward', function(event) {
    event.preventDefault();
    forwordVideo(player);
    forwordVideo(otherPlayer);
});
$(document).on('click', '.left-video-forward', function(event) {
    event.preventDefault();
    forwordVideo(player);
});
$(document).on('click', '.right-video-forward', function(event) {
    event.preventDefault();
    forwordVideo(otherPlayer);
});
function forwordVideo(playerName) {
    var video1TotalTime = playerName.duration();
    var video1CurrentTime = playerName.currentTime();
    var newDurationVideoTime = video1CurrentTime+changeDurationTime;
    if(video1TotalTime > video1CurrentTime && video1TotalTime > newDurationVideoTime) {
        playerName.currentTime(newDurationVideoTime);
    }
    else {
        playerName.currentTime(video1TotalTime);
    }
}

$(document).on('click', '.both-backward', function(event) {
    event.preventDefault();
    backwordVideo(player);
    backwordVideo(otherPlayer);
});
$(document).on('click', '.left-video-backward', function(event) {
    event.preventDefault();
    backwordVideo(player);
});
$(document).on('click', '.right-video-backward', function(event) {
    event.preventDefault();
    backwordVideo(otherPlayer);
});
function backwordVideo(playerName) {
    var video1TotalTime = playerName.duration();
    var video1CurrentTime = playerName.currentTime();
    var newDurationVideoTime = video1CurrentTime-changeDurationTime;
    if(video1TotalTime > 0 && newDurationVideoTime > 0) {
        playerName.currentTime(newDurationVideoTime);
    }
    else {
        playerName.currentTime(0);
    }
}
var video1ZoomingLevel = 1;
var video2ZoomingLevel = 1;
var configZoomingValue = 0.5;
//Zoom in - out
$(".left-video-zoom-in").click(function(event) {
    video1ZoomingLevel = video1ZoomingLevel + configZoomingValue;
    videoZoomInOut(player, video1ZoomingLevel);
});
$(".left-video-zoom-out").click(function(event) {
    if(video1ZoomingLevel > 1) {
        video1ZoomingLevel = video1ZoomingLevel - configZoomingValue;
        videoZoomInOut(player, video1ZoomingLevel);
    }
});
$(".right-video-zoom-in").click(function(event) {
    video2ZoomingLevel = video2ZoomingLevel + configZoomingValue;
    videoZoomInOut(otherPlayer, video2ZoomingLevel);
});
$(".right-video-zoom-out").click(function(event) {
    if(video2ZoomingLevel > 1) {
        video2ZoomingLevel = video2ZoomingLevel - configZoomingValue;
        videoZoomInOut(otherPlayer, video2ZoomingLevel);
    }
});

function videoZoomInOut(playerName, zoomValue) {
    playerName.zoomrotate({
            zoom: zoomValue
    });
}

$(document).on('click', '.btn-slow-motion', function(event) {
    event.preventDefault();
    var motion = $(this).data("motion") || 1;
    if(motion == 2) {
        configVideoPlaybackRates = 0.5
    }
    else if (motion == 4) {
        configVideoPlaybackRates = 0.25
    }
    else if (motion == 8) {
        configVideoPlaybackRates = 0.125
    }
    else {
        configVideoPlaybackRates = 1
    }

    var currentplayer = $(this).data('playername');
    if ( currentplayer == "player" ){
        player.playbackRate(configVideoPlaybackRates);
    }else {
        otherPlayer.playbackRate(configVideoPlaybackRates);
    }
    $('.btn-slow-motion').removeClass('active');
    $(this).addClass("active");
});
});