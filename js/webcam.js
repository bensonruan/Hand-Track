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
    }
  

    getMediaConstraints(mediaDevices) {
        var deviceIds = [];
        var selectedDevice = '';
        mediaDevices.forEach(mediaDevice => {
          if (mediaDevice.kind === 'videoinput') {
            deviceIds.push(mediaDevice.deviceId);
          }
        });      
        if(deviceIds.length > 0){
            selectedDevice = deviceIds[0];
        }else {
            return null;
        }

        var videoConstraints = {};
        if (selectedDevice === '') {
            videoConstraints.facingMode = this.facingMode;
        } else {
            videoConstraints.deviceId = { exact: selectedDevice};
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
                        resolve();
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