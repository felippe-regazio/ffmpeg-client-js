class FFMPEGClientProcessors {
	constructor(ffmpegClientInstance) {
		this.FF = ffmpegClientInstance;
	}

	process(options) {
		return this.FF.run(options);
	}

	/**
   * Trims a video file by start and end time
   *
   * @param {string} from 00:00:00
   * @param {string} to   00:00:00
   * @param {*} options   ffmpeg client options
   */
	trim(from, to, options) {
		options.args = `-i {{file}} -ss ${from} -to ${to} -c:v copy -c:a copy {{file}}`;

		return this.process(options);
	}

	/**
   * Split a video in equal time chunks
   *
   * @param {integer} time     time of each chunk
   * @param {options} options  ffmpeg client options
   */
	split(time, options) {
		options.args = `-i {{file}} -c copy -map 0 -segment_time ${time} -f segment -reset_timestamps 1 %03d_{{file}}`;

		return this.process(options);
	}

	/**
   * Generate a image thumb of the passed second
   *
   * @param {integer} sec momment to snapshot in seconds
   * @param {options} options  ffmpeg client options
   */
	thumb(sec, options) {
		options.args = ``;

		return this.process(options);
	}

	/**
   * Generate multiple thumbs of the passed seconds
   *
   * @param {array} secs array of integers (seconds)
   * @param {options} options  ffmpeg client options
   */
	thumbs(secs, options) {
		options.args = ``;

		return this.process(options);
	}
}
