# FFMPEG Wasm/Worker Experiment

This is an EXPERIMENT with FFMPEG Wasm and Web Workers. 
Contains a class to comounicate with and process files using a worker and the wasm.
Also contains some experiments on front in order to get non-uploaded video information.

# Getting started

Open the index.html file in your browser. The project is very simple:

### ffmpeg-wasm

This folder holds the ffmpeg wasm version. Check this repository to know more about:
// https://github.com/Kagami/ffmpeg.js/

### ffmpeg-woker.js

This is a web worker which uses the ffmpeg wasm to process videos with a given command

### ffmpeg-client.js

This is the web worker client. Its sends one or more videos with a given ffmpeg command, and get a result/error back.
All the process occurs asynchronously.

# Usage

1. Instantiate the ffmpeg-client:

```js
const ffmpeg = new FFMPEGWorkerClient({
  worker: '//url/to/ffmpeg-worker.js',       // the url to ffmpeg-worker.js file
  on: {
    loading: data => console.log(data),      // triggered when the ffmpeg wasm starts to load 
    ready: data => console.log(data),        // triggered when the ffmpeg wasm was loaded and ready to use
    notSupported: data => console.log(data)  // triggered if the browser doesn't support web workers
  }
});
```

2. Use your new instance to process videos:

```js
ffmpeg.run({
  arguments: `-i {{file}} -t 00:00:15 -c copy {{file}}`,     // args to pass to ffmpeg
  files: document.querySelector('input[type=file]').files,   // files to be processed
  on: {
    error: data => console.log(data),                        // triggered if some error occurs while processing the file
    busy: data => console.log(data),                         // triggered when starting to process the file
    done: data => {                                          // triggered when the files gets processed with no error

      console.log(data);

      // Download new data example

      const blob = new Blob([data.payload.result[0].data]);
      const src = window.URL.createObjectURL(blob);
      
      var a = document.createElement('a');
      a.download = data.payload.result[0].name;
      a.href = src;
      a.click();

    },
  }
});
```

The `{{file}}` part in the command will expand to the current file being processed. An array of Files is accepted as argument, but one file will be processed at a time. When you call the `run` function, it will check if the "ffmpeg worker" is ready. If not, it will add the file to the QUEUE. If the worker is ready, it will check if the worker is busy (processing something), if yes it will add the file to the QUEUE. When the worker gets ready, it process the QUEUE. If you call a run function when a file is being processed, it will be added to the end of the queue. This is how this client is designed to assure it wont harm the page performance.

# Methods

### Signature

```js
const ffmpeg = new FFMPEGWorkerClient(Options: Object) : FFMPEGWorkerClient
```

Options:

```js
{
  worker: '' : String,
  on: {
    loading:      fn : Function
    ready:        fn : Function
    notSupported: fn : Function
  }
}
```

### Run

```js
ffmpeg.run(Options: Object);
```

Options:

```js
{
  arguments: "", : String
  files: [], : Array of Files
  on: {
    busy:  fn, : Function
    error: fn (error),  : Function
    done:  fn (result), : Function
  }
}
```

### Compatibility

Checks if this lib is supported

```js
ffmpeg.supported() : Boolean
```

### Status

Tell the worker and client status at the moment

```js
ffmpeg.status() : Object
```

Returns:

```js
{
  busy: Boolean,                             // if some file is being processed
  queue: Array,                              // the current queue
  workerStatus: String | 'READY' | 'LOADING' // web worker status
}
```
