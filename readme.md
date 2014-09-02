# Si Ping Pong
We hacked our Ping Pong table! [Read the blog post.](http://sidigital.co/blog/lab-notes-hacking-our-ping-pong-table)

## Technology
- [node.js](http://nodejs.org)
- [socket.io](http://socket.io/)
- [React](http://facebook.github.io/react/)
- [gulp.js](http://gulpjs.com/)

## Building
Gulp is used to build the client. From the project root, run `npm install` and `gulp` to build.
The default Gulp task will build and then start watching.

### Sounds
[Audiosprite](https://github.com/tonistiigi/audiosprite) is used to build the sound sprite.
You'll first need to install Audiosprite:

    npm install -g audiosprite
    brew install ffmpeg --with-theora --with-libogg --with-libvorbis

Then run `npm run-script sounds` from the project root to rebuild the sprite.
It'll automatically include any .mp3 or .wav files included in the `ui/public/sounds` directory.
This will also rebuild the json file that contains the audio data required to play the individual sounds.

#### Voice Announcements
Voice announcements can be obtained from Google's unofficial TTS API. Audio can be downloaded from `http://translate.google.com/translate_tts?tl=en-gb&q={STRING}` – just replace `{STRING}` with the text to be spoken.

Point announcements have been downloaded for 0–40 (just in case a game lasts that long!). Here's a script you can run in the terminal to download a bunch of point announcements at once:

    for i in {0..40} ; do curl -q -A Mozilla -o ${i}.mp3 "http://translate.google.com/translate_tts?q=${i}&tl=en-gb" ; done

## Todo
- General restructuring and refactoring
- Add an easy method for plugging in events from custom hardware (adding players, recording points)
- Remove dependency on global vars (`game`, for example)
- Aim for strict mode compliance
- When an RFID tag that does not have an associated player is scanned, the ID should be emailed, posted to HipChat, etc. so that it can be easily added

### UI
- On first load, the leaderboard does not fade in like the other stats

### CSS
- <del>Add Autoprefixer</del> and strip vendor prefixes
- Make variables for commonly used values