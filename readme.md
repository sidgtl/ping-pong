# Si Ping Pong
We hacked our Ping Pong table! [Read the blog post.](http://sidigital.co/blog/lab-notes-hacking-our-ping-pong-table)

## Technology
- [node.js](http://nodejs.org)
- [socket.io](http://socket.io/)
- [React](http://facebook.github.io/react/)
- [gulp.js](http://gulpjs.com/)
- [Browserify](http://browserify.org/)

## Building
Gulp is used to build the client. From the project root, run `npm install` and `gulp` to build.
The default Gulp task will build and then start watching.

### Sounds
[Audiosprite](https://github.com/tonistiigi/audiosprite) is used to build the sound sprite.
You'll first need to install Audiosprite:

    npm install -g audiosprite
    brew install ffmpeg --with-theora --with-libogg --with-libvorbis

Then run `gulp sounds` from the project root to rebuild the sprite. This will:

- Fetch audio announcements for all players from Google's unofficial TTS API
- Fetch point announcements for scores 0–40 from Google's unofficial TTS API
- Include any .mp3 or .wav files in the `ui/public/sounds` directory
- Rebuild the JSON file that contains the audio data required to play the individual sounds

`gulp sounds` depends on a DB connection in order to get the player list. You may need to specify the environment to use, for example:
    NODE_ENV=development gulp sounds

Remember to rebuild the frontend after regenerating the sounds in order to include the updated sprite JSON in the Browserify build.

## Todo
- General restructuring and refactoring (v1 – new architecture, tidy events, move game logic client-side)
- Rather than mashing up audio, use full clips for each phrase for each player for more natural sounds (this should be automated)
- Add an easy method for plugging in events from custom hardware (adding players, recording points)
- Remove dependency on global vars (`game`, for example)
- Aim for strict mode compliance
- When an RFID tag that does not have an associated player is scanned, the ID should be emailed, posted to HipChat, etc. so that it can be easily added ... or just add an inactive player to the database?

### UI
- On first load, the leaderboard does not fade in like the other stats

### CSS
- <del>Add Autoprefixer</del> and strip vendor prefixes
- Make variables for commonly used values