const ffmpeg = new FFMPEGClient({
  worker: ' http://localhost/ffmpeg-wasm-client/src/ffmpeg-worker/worker.js',
  on: {
    loading: data => console.log(data),
    ready: data => console.log(data),
    notSupported: data => console.log(data)
  }
});

function processFiles (e) {
  e.preventDefault();

  ffmpeg.run({
    args: document.forms.theform.querySelector('input[name=ffmpeg-args]').value,
    files: document.forms.theform.querySelector('input[type=file]').files,
    on: {
      busy: data => console.log(data),

      done: data => {
        console.log(data);
        
        if (! data.blobs.length) {
          console.log('The result is empty');
        } else {
          Array.from(data.blobs).forEach((blob, index) => {
            download(data.result[index].name, blob);
          });
        }
      },

      error: data => console.log(data)
    }
  });
}

function download (name, blob) {
  const src = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  a.download = name;
  a.href = src;
  a.click();      
}