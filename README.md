# FFMPEG Wasm Client

This a dead simple FFMPEG Client for Front End Video Processing. This should NOT replace a backend infra-structure for video processing, but you can use it as a client-first option when processing your videos, letting your backend as a fallback layer whe it is not supported. You will have speed gain and coast reduction. This client supports basically any FFMPEG command over a simple File or array of Files, and is optimized to not use/freeze the JS main thread and keep a low heap usage.

# Getting Started - Setup

Since this module needs a Web Worker, you will need to add it to your project manually. This is because there is no reliable dynamic way to register a Web Worker since it depends on a complete URL pointing to the worker js file, and this endpoint may vary from project to project. There are some alternatives with strings, blobs and Object URLs to create a Web Worker dynamically, but they dont fit our necessities due unnecessary complexity and cache issues. So, to setup this module you must do the following steps:

1. Copy the `dist/ffmpeg-worker/` folder to somewhere in your app (preferably the root, but can be any place accessible via URL).
2. Add the `dist/index.js` and the `dist/processors.js` on your app.

Now you're ready to go.

# The FFMPEGClient Instance

To execute FFMPEG commands, first you must instantiate your client:

```js
const ffmpeg = new FFMPEGClient({
  worker: 'https://yourapp.com/ffmpeg-worker/worker.js',
  on: {
    loading: console.log,
    ready: console.log,
    notSupported: console.log
  }
});
```

### The Instance Callbacks

When instantiating your client, you have 3 callbacks:

|callback|definition|
|---|---|
|loading|triggered when the Web Worker starts to import the FFMPEG Wasm Module, any file you send to be processed will wait on a Queue and will be processed only when this process has finished. This process will be dramatically faster after the first time due the cache.|
|ready|triggered when the Web Worker has finished the FFMPEG Wasm Module Import, and its ready to process files.|
|noSupported|triggered when this module is not supported by the client, and no Worker will be registered.|

Example:

```js
const ffmpeg = new FFMPEGClient({
  worker: 'https://yourapp.com/ffmpeg-worker/worker.js',
  on: {
    loading: () => {
      console.log('The FFMPEG is being loaded');
    },
    ready: () => {
      console.log('The FFMPEG has been loaded');
    },
  }
});
```

### The Instance Methods

After instantiate the client, you can call the following methods:

|method|definition|
|---|---|
|ffmpeg|send files to be processed by FFMPEG and get the results|
|run|an alias to the `ffmpeg` method|
|isBusy|check if the instance is busy (processing something)|
|isReady|check if the instance is ready (has already loaded the FFMPEG)|
|supported|check if this module is supported by the client|

The `isBusy`, `isReady` or `supported` methods takes no params. Example:

```js
const ffmpeg = new FFMPEGClient({ worker: '...' });

ffmpeg.isReady();   // return true or false
ffmpeg.isBusy();    // return true or false
ffmpeg.supported(); // return true or false
```

# Processing Files

You can use the `ffmpeg` method to process files (or its alias: `run`).
Imagine that we have instantiated the FFMPEGClient as const `ffmpeg`:

```js
const myFiles = document.forms.myForm.querySelector('input[type=file]').files;

ffmpeg.run({
  files: myFiles,
  args: '-i {{file}} -t 00:00:15 -c copy {{file}}',
  on: {
    busy: console.log,
    error: console.log,
    done: data => {
      // this is the result
      console.log(data);
    }
  }
});
```

The command above will run the `ffmpeg` with the given `args` for each file in `myFiles`, if an error occours, the `error` callback will be triggered passing the { error } as argument, if no error happened, the `done` callback will be triggered passing the { result } as argument.

**Attention**: you must omit the "ffmpeg" word from `args`, Also, the `files` key accepts a single file or an array of files. If an array of file is passed, the command will run separately on each file in a FIFO order of processing. There will be no concurrent files, one file will be processed at a time to avoid high memory usage. On success (done) all the processed files will be returned. On error, no files will be returned.

**Pro Tip**: You can with arguments for multiple files since each file has a different name. To avoid problemas you can use the magic word `{{file}}` on args, which will be replaced for the name of the current file being processed.

# How it Works?

This module is optimized to work with multiple files at once without warm the client or the app payload, to achieve it, the following steps will happen when you instantiate your ffmpeg client:

1. The instance will check if the current client supports this module by looking for Web Worker availability, Wasm compatibility and a bunch of other configurations.

2. If compatible, a Web Worker will be registered. A Worker can handle heavy processing tasks in background without freeze the JS main thread, and have a good cache capabilities. In our case, the Worker is the layer that talks directly with the FFMPEG Wasm Module.

3. Once registered, the Web Worker will import and cache the FFMPEG Wasm Module. The cache is very important here since the Wasm module has 26MB (6MB Gzipped). This wont harm your connection since it will be imported asynchronously in background. Its a good practice to deactivate this module for mobile devices. Once cached, the FFMPEG Wasm Module wont have the import cold start again.

4. The Worker will inform the Client that the FFMPEG was imported and cached, and your is all configured and ready to process videos directly from the client.

5. When you send a command to process a Video, the client will collect the information (arguments, files, callbacks), send to the Worker and wait for the result. If you send multiple files at once, or if the Worker its not ready yet, your task will be added to a Queue that will be processed as soon as possible. This queue avoids high heap allocation and high memory usage.