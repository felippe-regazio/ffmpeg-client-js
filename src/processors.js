class FFMPEGClientProcessors {
  constructor (ffmpegClientInstance) {
    this.FF = ffmpegClientInstance;
  }

  test () {
    console.log(this.FF);
  }

  trim (from, to, options) {
    options.args = ``;

    return this.FF.run(options);
  }

  chunks (secs, options) {

  }
}