function send (type, data) {
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
      args = args.concat(t.split(" "));
    }
  });
  
  return args;
}

function parseFile (file) {
  let _file = {};

  if (file instanceof Uint8Array) {
    _file = file;
  }

  if (file instanceof File) {
    _file = fileToUint8Array(file);
  }

  return {
    name: file.name,
    data: _file
  }
}

function fileToUint8Array (file) {
  return new Uint8Array(new FileReaderSync().readAsArrayBuffer(file));
}

function execute (task) {
  send('busy', {});

  let files = task.files;
  let arguments = task.args;

  let stdout = '';
  let result = [];

  if (files && files.length) {
    Array.from(files).forEach(file => {
      const _file = parseFile(file);
      const _args = parseArgs(arguments.replace(/\{\{file\}\}/g, file.name));

      const r = ffmpeg_run({
        stdin: () => {},
        files: [ _file ],
        arguments: _args,
        print: out => stdout += `\n${out}`,
        printErr: out => stdout += `\n${out}`,
        onExit: error => {
          send('error', { error, stdout });

          return false;
        },
      });

      result.push( r[0] );
    });
  }

  return postMessage({
    result,
    stdout,
    type: 'done',
    blobs: result.map(r => new Blob([ r.data ]))
  });
}

// ---------------------------------------------------

send('loading', {});

importScripts('./ffmpeg-wasm.js');

self.onmessage = e => execute(e.data);
self.onerror = error => send('error', error);
self.onmessageerror = error => send('error', error);

send('ready', {});