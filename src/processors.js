class FFMPEGClientProcessors {
  constructor (ffmpegClientInstance) {
    this.FF = ffmpegClientInstance;
  }

  process (options) {
    return this.FF.run(options);
  }

  /**
   * Trims a video file by start and end time
   * 
   * @param {string} from 00:00:00
   * @param {string} to   00:00:00 
   * @param {*} options   ffmpeg client options
   */
  trim (from, to, options) {
    options.args = `-ss ${from} -i {{file}} -to ${to} -c copy {{file}}`;

    return this.process(options);
  }

  /**
   * Split a video in equal time chuncks
   * 
   * @param {integer} secs     time of each chunck in seconds
   * @param {options} options  ffmpeg client options
   */
  chunks (secs, trim, options) {
    options.args = ``;

    return this.process(options);
  }

  /**
   * Generate a image thumb of the passed second
   * 
   * @param {integer} sec momment to snapshot in seconds
   * @param {options} options  ffmpeg client options
   */
  thumb (sec, options) {
    options.args = ``;

    return this.process(options);    
  }

  /**
   * Generate multiple thumbs of the passed seconds
   * 
   * @param {array} secs array of integers (seconds)
   * @param {options} options  ffmpeg client options
   */
  thumbs (secs, options) {
    options.args = ``;

    return this.process(options);
  }
}