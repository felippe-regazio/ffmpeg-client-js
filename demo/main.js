const ffmpeg = new FFMPEGClient({
  worker: '../dist/ffmpeg-worker/worker.js',
  on: {
    loading: console.log,
    ready: console.log,
    notSupported: console.log
  }
});

const ffmpegProcessors = new FFMPEGClientProcessors(ffmpeg);

// ---------------------------------------------------------

function processFiles (e) {
  e.preventDefault();
  
  const form = document.forms.theform;

  ffmpeg.run({
    files: form.querySelector('input[type=file]').files,
    args: form.querySelector('input[name=ffmpeg-args]').value,
    on: {
      busy: console.log,
      error: console.log,
      done: doneCallback,
    }
  });
}

function trimFiles (e) {
  e.preventDefault();

  const form = document.forms.theform;
  const files = form.querySelector('input[type=file]').files;
  const start = form.querySelector('input[name=start-time]').value;
  const end = form.querySelector('input[name=end-time]').value;

  ffmpegProcessors.trim(start, end, {
    files: files,
    on: {
      busy: console.log,
      error: console.log,
      done: doneCallback,
    }
  })
}

function splitFiles (e) {
  e.preventDefault();

  const form = document.forms.theform;
  const files = form.querySelector('input[type=file]').files;  
  const time = form.querySelector('input[name=chunk-time]').value;

  ffmpegProcessors.split(time, {
    files: files,
    on: {
      busy: console.log,
      error: console.log,
      done: doneCallback,
    }
  });
}

function doneCallback (data) {
  console.log(data);
        
  data.result.forEach(output => {
    output.blobs.forEach((blob, index) => {
      download(output.buffers[index].name, blob);
    });
  });
}

function download (name, blob) {
  const src = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.download = name;
  a.href = src;
  a.click();      
}