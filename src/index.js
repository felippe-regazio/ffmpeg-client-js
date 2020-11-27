class FFMPEGClient {
  constructor (options) {
    this.QUEUE = [];
    this.READY = false;
    this.OPTIONS = options;
    this.WORKER = undefined;
    this.SUPPORTED = this._supported();

    if (window.__FFMPEGCLIENT) {
      return window.__FFMPEGCLIENT;
    } else {
      this._init();
    }
  }

  _supported() {
    return window && window.Worker;
  }    

  _init () {
    if (this.SUPPORTED) {
      window.__FFMPEGCLIENT = this;

      this._registerCallbacks(this.OPTIONS.on);
      this._registerWorker(this.OPTIONS.worker);
    } else {    
      this.OPTIONS.on.notSupported({
        message: 'Your environment doesn\'t support ffmpeg-worker-client or you\'re not in a Browser.'
      });
    }
  }  

  _registerCallbacks (context) {
    const noop = () => {};

    const callbacks = [
      'loading',
      'ready',
      'busy',
      'done',
      'error',
      'message',
      'notSupported'
    ];

    callbacks.forEach(cb => {
      if (!context[cb]) {
        context[cb] = noop;
      }
    });
  }

  _registerWorker (url) {
    this.WORKER = new Worker(url);
    
    this._listenWorker(false);
  }

  _listenWorker (callbacks) {
    this.WORKER.onmessage = message => {
      const type = message.data.type;
      const data = message.data;
      
      this.OPTIONS.on.message(data);
      this.OPTIONS.on[type](data);

      if (callbacks && callbacks[type]) {
        callbacks[type](data); 
      }

      this._onWorkerMessage (message);
    }
  }

  _onWorkerMessage (message) {
    const type = message.data.type;

    switch (type) {
      case 'ready':
        this.READY = true;
        this._processQueue();
        break;

      case 'busy':
        this.BUSY = true;
        break;

      case 'done':
      case 'error':
        this.BUSY = false;
        this._processQueue();
        break;
    }
  }

  _processQueue () {
    if (this.QUEUE.length) {
      const task = this.QUEUE.shift();

      this.ffmpeg(task);
    }
  }

  // ------------------------------------------------

  ffmpeg (task) {
    if (!task) return;

    if (!this.READY || this.BUSY) {
      this.QUEUE.push(task);
    } else {
      this.WORKER.postMessage({
        files: task.files,
        args: task.args
      });

      return this._listenWorker(task.on);
    }
  }

  run (task) {
    return this.ffmpeg(task);
  }

  version () {
    return `FFMPEG Worker 0.0.1`;
  }
}