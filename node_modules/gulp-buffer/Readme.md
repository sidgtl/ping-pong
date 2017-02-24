# gulp-buffer

  Some gulp plugins do not support streaming file contents. gulp-buffer and gulp-stream come to the rescue.
  
  There are 3 main reasons why a gulp plugin may not support stream :

    * The stream support is on the roadmap but has not been added to the plugin
    * The underlying library used for the transformation does yet support a streaming API
    * The content transformation is not very well suited for streaming (think of content.reverse() for example where you need the end of the file first)

  In all these cases, simply add gulp-buffer in front of such a plugin, and it will make sure that the plugin is presented only with buffers.

  When you want to go back to full streaming capabilities, add gulp-stream and it will make sure that all your files are streamed again.


[![build status](https://secure.travis-ci.org/jeromew/gulp-buffer.png)](http://travis-ci.org/jeromew/gulp-buffer)

## Installation

```bash
$ npm install gulp-buffer
```

# Licence

  MIT

