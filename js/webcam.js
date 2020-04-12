class Webcam {
    constructor(webcamElement, facingMode) {
      this.webcamElement = webcamElement;
      this.webcamElement.width = this.webcamElement.width || 640;
      this.webcamElement.height = this.webcamElement.height || video.width * (3 / 4);
      this.facingMode = facingMode;
      this.webcamList = [];
      this.selectedDeviceId = '';
    }

    /* Get all video input devices info */
    getVideoInputs(mediaDevices){
      this.webcamList = [];
      mediaDevices.forEach(mediaDevice => {
        if (mediaDevice.kind === 'videoinput') {
          this.webcamList.push(mediaDevice);
        }
      });
      if(this.webcamList.length == 1){
        this.facingMode = 'user';
      }    
      return this.webcamList;
    }

    /* Get media constraints */
    getMediaConstraints() {
        var videoConstraints = {};
        if (this.selectedDeviceId == '') {
            videoConstraints.facingMode =  this.facingMode;
        } else {
            videoConstraints.deviceId = { exact: this.selectedDeviceId};
        }
        var constraints = {
            video: videoConstraints,
            audio: false
        };
        return constraints;
    }

    /* Select camera based on facingMode */ 
    selectCamera(){
      for(let webcam of this.webcamList){
        if(   (this.facingMode=='user' && webcam.label.toLowerCase().includes('front'))
          ||  (this.facingMode=='enviroment' && webcam.label.toLowerCase().includes('back'))
        )
        {
          this.selectedDeviceId = webcam.deviceId;
          break;
        }
      }
    }

    /* Change Facing mode and selected camera */ 
    flip(){
      this.facingMode = (this.facingMode == 'user')? 'enviroment': 'user';
      this.selectCamera();  
    }

    /*
      1. Get permission from user
      2. Get all video input devices info
      3. Select camera based on facingMode 
    */
    async setup() {
      return new Promise((resolve, reject) => {         
        this.stop();
        navigator.mediaDevices.getUserMedia(this.getMediaConstraints()) //get permisson from user
          .then(stream => {
            this.info() //get all video input devices info
              .then(webcams =>{
                this.selectCamera();   //select camera based on facingMode
                resolve(this.selectedDeviceId);
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

    /* Get all video input devices info */ 
    async info(){
      return new Promise((resolve, reject) => {            
        navigator.mediaDevices.enumerateDevices()
          .then(devices =>{
            this.getVideoInputs(devices);
            resolve(this.webcamList);
          }) 
          .catch(error => {
            reject(error);
          });
      });
    }
  
    /* Start streaming webcam to video element */ 
    async start() {
      return new Promise((resolve, reject) => {         
        this.stop();
        navigator.mediaDevices.getUserMedia(this.getMediaConstraints())
          .then(stream => {
              this.currentStream = stream;
              this.webcamElement.srcObject = stream;
              this.webcamElement.play();
              resolve(this.facingMode);
          })
          .catch(error => {
              reject(error);
          });
      });
    }

    /* Stop streaming webcam */ 
    stop() {
      if (typeof this.currentStream !== 'undefined') {
          this.currentStream.getTracks().forEach(track => {
              track.stop();
          });
      }
    }
  }