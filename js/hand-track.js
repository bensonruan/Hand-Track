const webcamElement = document.getElementById('webcam');
const canvasElement = document.getElementById('canvas');
const webcam = new Webcam(webcamElement, 'enviroment');
let model = null;
let cameraFrame = null;
let handCount = 0;
let fireElements = [];
//let dots = [];

$("#webcam-switch").change(function () {
    if(this.checked){
        $('.md-modal').addClass('md-show');
        webcam.start(false)
            .then(result =>{
                startHandMagic();
            })
            .catch(err => {
                displayError();
            });
    }
    else {        
        $("#errorMsg").addClass("d-none");
        stopHandMagic();
    }        
});

$('#cameraFlip').click(function() {
    if(cameraFrame!= null){
        cancelAnimationFrame(cameraFrame);
    }
    webcam.flip();
    startHandMagic();
    
});

$('#closeError').click(function() {
    $("#webcam-switch").prop('checked', false).change();
});

function startHandMagic(){
    webcam.stream()
        .then(result => {
            cameraStarted();
            loadModel().then(res => {
                cameraFrame = startDetection();
            })
            .catch(err => {
                displayError('Fail to load hand tracking model, please refresh the page to try again');
            });
        })
        .catch(err => {
            displayError();
        });
}

function stopHandMagic(){
    cameraStopped();
    webcam.stop();
    if(cameraFrame!= null){
        cancelAnimationFrame(cameraFrame);
    }
}

function displayError(err = ''){
    if(err!=''){
        $("#errorMsg").html(err);
    }
    $("#errorMsg").removeClass("d-none");
}

async function loadModel() {
    $(".loading").removeClass('d-none');
    var flipWebcam = (webcam.facingMode =='user') ? true: false
    return new Promise((resolve, reject) => {
        const modelParams = {
            flipHorizontal: flipWebcam,   // flip e.g for video  
            maxNumBoxes: 20,        // maximum number of boxes to detect
            iouThreshold: 0.5,      // ioU threshold for non-max suppression
            scoreThreshold: 0.8,    // confidence threshold for predictions.
        }

        handTrack.load(modelParams).then(mdl => { 
            model = mdl;
            $(".loading").addClass('d-none');
            resolve();
        }).catch(err => {
            reject(error);
        });
    });
}

function startDetection() {
    model.detect(webcamElement).then(predictions => {
        //console.log("Predictions: ", predictions);
        showFire(predictions);
        cameraFrame = requestAnimFrame(startDetection);
    });
}

function showFire(predictions){
    if(handCount != predictions.length){
        $("#canvas").empty();
        fireElements = [];
        //dots = [];
    }   
    handCount = predictions.length;

    for (let i = 0; i < predictions.length; i++) {
        //bbox: [x, y, width, height]
        var hand_center_point = getHandCenterPoint(predictions[i].bbox);
        //if(dots.length > i){
            //dot = dots[i];
        //}
        //else{
            //dot = $("<div class='dot'></div>");
            //dots.push(dot);
            //dot.appendTo($("#canvas"));
        //}
        //dot.css({top:hand_center_point[0], left:hand_center_point[1], position:'absolute'});

        if (fireElements.length > i) { 
            fireElement = fireElements[i];
        }else{
            fireElement = $("<div class='fire_in_hand'></div>");
            fireElements.push(fireElement);
            fireElement.appendTo($("#canvas"));
        }
        var fireSizeWidth = fireElement.css("width").replace("px","");
        var fireSizeHeight = fireElement.css("height").replace("px","");
        var firePositionTop = hand_center_point[0]- fireSizeHeight;
        var firePositionLeft = hand_center_point[1] - fireSizeWidth/2;
        fireElement.css({top: firePositionTop, left: firePositionLeft, position:'absolute'});
    }
}

function getHandCenterPoint(bbox){
    var ratio = canvasElement.clientHeight/webcamElement.height;
    if(webcam.webcamList.length ==1 || window.innerWidth/window.innerHeight >= webcamElement.width/webcamElement.height){
        var leftAdjustment = 0;
    }else{
        var leftAdjustment = ((webcamElement.width/webcamElement.height) * canvasElement.clientHeight - window.innerWidth)/2 
    }
    var x = bbox[0];
    var y = bbox[1];
    var w = bbox[2];
    var h = bbox[3];
    var hand_center_left = x*ratio + (w*ratio/2) - leftAdjustment;
    var hand_center_top = y*ratio + (h*ratio/2);
    return [hand_center_top, hand_center_left];
}

$(window).resize(function() {
    var ratioWebCamWidth = webcamElement.scrollHeight * (webcamElement.width/webcamElement.height);
    var canvasWidth = (ratioWebCamWidth < window.innerWidth) ? ratioWebCamWidth : window.innerWidth;
    $("#canvas").css({width: canvasWidth});
});

function cameraStarted(){
    $("#errorMsg").addClass("d-none");
    $("#webcam-caption").html("on");
    $("#webcam-control").removeClass("webcam-off");
    $("#webcam-control").addClass("webcam-on");
    $(".webcam-container").removeClass("d-none");
    var ratioWebCamWidth = webcamElement.scrollHeight * (webcamElement.width/webcamElement.height);
    var webCamFullWidth = webcamElement.scrollWidth;
    $("#canvas").css({width: ((ratioWebCamWidth < webCamFullWidth) ? ratioWebCamWidth : webCamFullWidth)});
    if( webcam.webcamList.length > 1){
        $("#cameraFlip").removeClass('d-none');
    }
    if(webcam.facingMode == 'user'){
        $("#webcam").addClass("webcam-mirror");
    }
    else{
        $("#webcam").removeClass("webcam-mirror");
    }
    $("#wpfront-scroll-top-container").addClass("d-none");
    window.scrollTo(0, 0); 
    $('body').css('overflow-y','hidden');
}

function cameraStopped(){
    $("#wpfront-scroll-top-container").removeClass("d-none");
    $("#webcam-control").removeClass("webcam-on");
    $("#webcam-control").addClass("webcam-off");
    $("#cameraFlip").addClass('d-none');
    $(".webcam-container").addClass("d-none");
    $("#webcam-caption").html("Click to Start Camera");
    $('body').css('overflow-y','scroll');
    $([document.documentElement, document.body]).animate({
        scrollTop: ($("#hand-app").offset().top - 80)
    }, 1000);
    $('.md-modal').removeClass('md-show');
}

window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame    ||
        window.oRequestAnimationFrame      ||
        window.msRequestAnimationFrame     ||
        function( callback ){
            window.setTimeout(callback, 1000 / 60);
        };
})();

window.cancelAnimationFrame = (function(){
    return  window.cancelAnimationFrame || window.mozCancelAnimationFrame;
})();