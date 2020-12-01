function send(type, data) {
	return postMessage({
		payload: data,
		type: type.toLowerCase(),
	});
}

function parseArgs(text) {
	let args = [];

	text = text.replace(/\s+/g, ' ');

	text.split('"').forEach(function(t, i) {
		t = t.trim();
		if ((i % 2) === 1) {
			args.push(t);
		} else {
			args = args.concat(t.split(' '));
		}
	});

	return args;
}

function parseFile(file) {
	let _file = {};

	if (file instanceof Uint8Array) {
		_file = file;
	}

	if (file instanceof File) {
		_file = fileToUint8Array(file);
	}

	return {
		name: file.name,
		data: _file,
	};
}

function fileToUint8Array(file) {
	return new Uint8Array(new FileReaderSync().readAsArrayBuffer(file));
}

function execute(task) {
	send('busy', {});

	const files = task.files;
	const args = task.args;

	const result = [];
	const errors = [];

	let stdout = '';

	if (!files || !files.length) {
		return send('error', {
			args,
			stdout: '',
			error: 'The "files" payload is empty, there is nothing to process',
		});
	}

	Array.from(files).forEach(file => {
		if (errors.length) return false;

		const _file = parseFile(file);
		const _args = parseArgs(args.replace(/\{\{file\}\}/g, file.name));

		const r = ffmpeg_run({
			stdin: () => {},
			files: [_file],
			arguments: _args,
			print: out => stdout += `\n${out}`,
			printErr: out => stdout += `\n${out}`,
			onExit: error => {
				errors.push({ error, stdout });

				return false;
			},
		});

		if (!r || !r.length) {
			/* eslint-disable max-len */
			errors.push({ error: `The ffmpeg exec returned an empty result for file "${_file.name}". This may be caused by a runtime error\,
			a bad input, corrupted file, wrong or no arguments, or bad network connection. Check the stdout for details.`.replace(/\s\s+/g, ' '), stdout });
			/* eslint-enable max-len */
		} else {
			result.push({
				buffers: r,
				name: _file.name,
				args: _args.join(' '),
				blobs: r.map(r => new Blob([r.data])),
			});
		}
	});

	if (errors.length) {
		const error = { args, ...errors[0] };

		send('error', error);
	} else {
		postMessage({
			result,
			stdout,
			type: 'done',
		});
	}
}

// ---------------------------------------------------

send('loading', {});

importScripts('./ffmpeg.js');

self.onmessage = e => execute(e.data);
self.onerror = error => send('error', error);
self.onmessageerror = error => send('error', error);

send('ready', {});
