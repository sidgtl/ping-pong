var through = require('through2');

// Consts
const PLUGIN_NAME = 'gulp-buffer';

function gulpBuffer() {
  var stream = through.obj(function(file, enc, callback) {

    // keep null files as-is
    if (file.isNull()) {
      this.push(file);
      return callback();
    }

    // keep buffer files as-is
    if (file.isBuffer()) {
      this.push(file);
      return callback();
    }

    // transform stream files into buffer
    if (file.isStream()) {
       var self = this;
       var c_stream = file.contents;
       var chunks = [];
       var onreadable = function() {
         var chunk;
         while (null !== (chunk = c_stream.read())) {
           chunks.push(chunk);
         }
       };
       c_stream.on('readable', onreadable);
       c_stream.once('end', function() {
	 c_stream.removeListener('readable', onreadable);
         file.contents = Buffer.concat(chunks);
         self.push(file);
	 callback();
       });
       return;
    }
  });

  return stream;
};

module.exports = gulpBuffer;
