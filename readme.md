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

## Python requirements
For calculating the player's skill level we use Microsoft's trueSkill algorithm. To use it in the project make sure you install python-dev and the following python packages: trueskill, sqlalchemy, mysql-python. You can get them easily using pip. You also needt the mysql\_config command. For linux debianoid distros you get them from package libmysqlclient-dev. For the interface python&lt;-&rt;nodejs we use python-shell which is pulled in by npm's package.json

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