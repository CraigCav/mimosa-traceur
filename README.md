mimosa-traceur
===========
## Overview

This module will allow you to utilize features form JavaScript.next today. For a glipmse of the features the module should enable, take a look at [es6fiddle](http://www.es6fiddle.net/);

For more information regarding Mimosa, see http://mimosa.io
For more information regarding Traceur, see https://github.com/google/traceur-compiler

## Usage

Add `'traceur'` to your list of modules.  Mimosa will install the module for you when you start up.

If you are currently using mimosa's [copy](https://github.com/dbashford/mimosa-copy) module it is best that `js` be removed from the mimosa configuration for copy:

```coffee
// "js" extension should be removed so that it does not confict with the traceur compiler
copy
  extensions: ["css","png","jpg","jpeg","gif","html","eot","svg","ttf","woff","otf","yaml","kml","ico","htc","htm","json","txt","xml","xsd","map","md","mp4"]
```

## Functionality

This module will take your ES6 syntax code and compile it down to a syntax usable with ES5 complient engines/browsers.