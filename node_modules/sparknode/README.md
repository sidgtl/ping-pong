#About

Sparknode is built to make it easier for your server-side (or node-webkit) code to communicate with the spark cloud, so that you can do more with your core with less overhead.

It's designed to be hopefully as easy to use as possible with a low barrier to entry.  All you need to do to get started is provide your access token and sparknode, along with the [Spark Cloud](http://docs.spark.io/#/api), will set everything up for you.

Your cores become part of a collection, accessible by name, and will have their Cloud functions and variables accessible as methods on the 'Core' objects. Hooking into Spark Cloud events is as easy as attaching a listener via the 'on' method for your core. Your callback will be called each time that event, or every event if you pass 'event' as the event name, is fired.

###[Example](#example-1)

#Constructors
1. [Core](#core)
2. [Collection](#collection)

##Core
Create a new instance of a spark core. First parameter is accessToken, second parameter is deviceId.

An object can also be used as the first parameter, as follows:

```javascript
var spark = require('sparknode');

var core = new spark.Core({
  accessToken: <Your Auth_Token>,
  id: <Your device id>
});
```

###Cloud Events
Each event is accessible to your core (or collection) through the builtin events.  You can simply call `core.on(eventName, function handler(eventData) {/*do something;*/});` to register your handler on the event.  If 'event' is passed to the `on` function as the name, then the handler will be called for every event with an `{event: 'eventName', data: {/*eventData*/}}` object.

```javascript
core.on('coffeeBrewed', function(info) {
  console.log(info);
  console.log(info.data);
  //send an email with the number of cups remaining.
});

collection.on('event', function(eventInfo) {
  database.save(eventInfo);
  //All events for all cores get logged to the database.
  //API for public events coming shortly.
});
```

###Cloud Functions
Each function accepts a string as the parameter, and a callback to be called upon return.

The signature of the callback should be `function(err, data)`.

```javascript
core.brew('coffee', function(err, data) {
  console.log(data);
});
```

###Cloud Variables
Each variable (exposed as functions) accepts a callback as its first parameter, with the same signature as above (err, data).

```javascript
core.variable1(function(err, data) {
  console.log(data);
});
```

Variables also have a property, autoupdate, that can be set with a timeout in milliseconds between each call, or true to use the default 5 second interval or false to cancel autoupdates. Setting this variable will also start the update cycle.

When being used with autoupdate, the variable (not the core) will fire an `'update'` event each time a response is received from the server.

```javascript
//Start autoupdate
core.variable1.autoupdate = 2000;

//Do something on update
core.variable1.on('update', function(value) {
  console.log(value);
  console.log(core.variable1.value);
});

//Stop update with any falsy value.
core.variable1.autoupdate = false;

```

The last known value can be retreived as a property (value) of the function.

```javascript
console.log(core.variable1.value);
```

##Collection
Even better, get all your spark cores at once, complete with everything they can do.

Once loaded, the collection instance contains all your spark cores by name.

```javascript
collection.core1.doFunction('foo', function(err, data) {
  //Do something
});
```

The default behavior is to cache the output of the cloud api for all HATEOS calls in a JSON object at your project root.  If you'd like to override this behavior, you can pass an options object (optional, of course) to the constructor.

```javascript
var collection = new Collection(myAuthToken, { skipCache: true })
```
or
```javascript
var collection = new Collection(myAuthToken, { cacheFile: 'lib/cacheFile.json' } )
```

##Example

Imagine you have some two spark cores, which you've named core1 and core2. Imagine you also like coffee enough to dedicate a sparkcore to brewing coffee. Not hard to imagine, I'd guess.

So you've set up at least one function, `brew()`,  one variable,  `remainingCoffeeTime`, and one event, `coffeeDone`, on core2. Core1 still has tinker installed, or at least has the digitalWrite function.

```javascript
var sp = require('sparknode');
var collection = new sp.Collection(myAuthToken);
collection.on('connect', function() {
  //Turn on an led
  collection.core1.digitalwrite('d7,HIGH');

  //Brew some coffee, then email me.
  collection.core2.brew('coffee', function(err, timeUntilFinished) {
    if(err) {
      throw err;
    }

    emailMe('' + timeUntilFinished + ' milliseconds until your coffee is ready.');
  })

  colleciton.core2.on('coffeeDone', function() {
    emailMe('Your coffee is done. Enjoy!');
  });

  //Get a variable
  collection.core2.remainingCoffeeTime(function(err, value) {
    //Do something with value
  })
```

And an example of a single core.

```javascript
var randomCore = new sp.Core(myAuthToken, deviceId);

randomCore.on('connect', function() {
  randomCore.turnOnLights();
});
```

#CLI

If installed globally via `npm install -g sparknode`, sparknode will give you a command line interface mostly useful for debugging, but I suppose it could be used for other scripting applications as well.

The most important command is probably `sn -h`, as it lets you discover the functionality directly from the command line.

As for the rest, right now there are three main commands under the main `sn` command: `add`, `fn`, and `var`. Each of these also have help generated with the -h switch.

####add
Spark add will retreive any cores accessible via the given token. These are saved at your home directory under .sparkrc.

Syntax is `sn add <token>`.

####var
Retreive a variable from the spark cloud. 

Syntax is `sn var coreName [varName]`. If no `varName` is included, the list of registered variables will be printed.

Options include:

-n Number of times to check the variable (--number)

-i Interval, in milliseconds, between checks (--interval)

-c Check continously at interval or 1 second. (will override -n) (--continuous)

####fn
Execute a remote function and print the return value. If no `functionName` is included, the list of registered functions will be printed.

Syntax is `sn fn <coreName> <functionName> <argument>`.

####events

Syntax: `sn events [coreName]`

Print a list of events coming from the spark cloud. If a coreName is supplied, then the events are limited to that core's events. Press ctrl-c to interrupt, as usual.

Options: 

-p Show a list of public events.
-n Only search for events with a specific name.

```bash
sn events -p

{ data: 
  { data: 'course',
    ttl: '60',
    published_at: '2014-03-13T10:42:23.157Z',
    coreid: '48ff69065067555019392287'
  },
  event: 'motion-detected2' 
}
...

#I have a hard time believing mr. 48ff69065067555019392287 is seeing motion every single second. amirite?
```

####ls
Get either a list of cores and their functions or a single core.

You can optionally pull an update first with the `-u` option in case you want to list new functionality.

Syntax: `sn ls [coreName]`

Output Example:

```bash
sn ls
Core: core1 (1234567890abcdef12345678)

Functions: 
brew
digitalread
digitalwrite
analogread

Variables: 
delay

Connected: true

-----------

Core: core2 (1234567890abcdef12345679)

Functions: 
getdata
digitalread
digitalwrite
analogread

Variables: 
delay

Connected: true

-----------

```

##CLI Examples

  ```bash
#Go get all the cores.
  sn add 1234567890abcdef1234567890abcdef

#The following cores were found and saved: 
#core1 1234425432363457d
#core2 1212532454325acef

  sn fn core1

#Functions available for core 'core1':
#  brew
#  digitalread
#  digitalwrite
#  analogread

  sn fn core1 brew coffee;
#1

  sn fn core2
#  digitalwrite

  sn fn core2 digitalwrite "A1,HIGH";

  sn var core1

#Variables available for core 'core1':
#  brewTime
#  variable1

  sn var core1 brewTime;

#  120000

  sn var core2

#Variables available for core 'core2':
#  coffeeStrength

  sn var -i 100 -n 5 core2 coffeeStrength;

#100
#100
#98
#99
#96

#My current personal favorite:
  sn var -ci 100 core1 variable1;

#1
#2
#3
#4
#5
#...
  ```


##Future

  Future:

  I'd like to write a custom firmware that's CLI flashable and uses TCP directly for faster feedback. You're already using Node, so you have that option. It should be possible to write very powerful client-server code using something like this. I'd also like to keep it modular so it's useful on its own.

  I'm also thinking about writing a custom firmware that lets you add many more than 4 functions, directly from the CLI or even programmatically, using string parsing on the client side. I don't know about anyone else, but I don't need 64 characters of input very often, so I figured they'd be more useful this way. Check out the issues tracker to add feature requests and see some of the plans I have.
