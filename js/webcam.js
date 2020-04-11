class Webcam {
    /**
     * @param {HTMLVideoElement} webcamElement A HTMLVideoElement representing the
     *     webcam feed.
     */
    constructor(webcamElement, facingMode) {
      this.webcamElement = webcamElement;
      this.webcamElement.width = this.webcamElement.width || 640;
      this.webcamElement.height = this.webcamElement.height || video.width * (3 / 4);
      this.facingMode = facingMode;
      this.webcams = [];
    }
    
    flipCamera(){
      if(this.facingMode == 'user') {
        this.facingMode = 'enviroment';
      }
      else {
        this.facingMode = 'user';
      }
    }

    getMediaConstraints(mediaDevices) {
        this.webcams = [];
        var selectedDevice = null;
        mediaDevices.forEach(mediaDevice => {
          if (mediaDevice.kind === 'videoinput') {
            this.webcams.push(mediaDevice);
          }
        });    
        if (this.webcams.length > 1){
          selectedDevice = null;  
        }
        else if (this.webcams.length == 1){
          selectedDevice = this.webcams[0];
          this.facingMode = 'user';
        }
        else {
            return null;
        }

        var videoConstraints = {};
        if (selectedDevice == null) {
            videoConstraints.facingMode = this.facingMode;
        } else {
            videoConstraints.deviceId = { exact: selectedDevice.deviceId};
        }
        var constraints = {
            video: videoConstraints,
            audio: false
        };

        return constraints;
    }

    stop() {
        if (typeof this.currentStream !== 'undefined') {
            this.currentStream.getTracks().forEach(track => {
                track.stop();
            });
        }
    }
  
    async start() {
      return new Promise((resolve, reject) => {
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;            
            navigator.mediaDevices.enumerateDevices()
              .then(devices =>{
                this.stop();
                var mediaConstraints = this.getMediaConstraints(devices);
                if(mediaConstraints == null){
                  reject();
                }
                navigator.mediaDevices.getUserMedia(mediaConstraints)
                    .then(stream => {
                        this.currentStream = stream;
                        this.webcamElement.srcObject = stream;
                        this.webcamElement.play();
                        resolve([this.webcams.length, this.facingMode]);
                    })
                    .catch(error => {
                        reject(error);
                    });
              }) 
              .catch(error => {
                reject(error);
              });
      });
    }
  }