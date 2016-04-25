Bootstrap
--
Bootstrap is used to provide the look and feel for the user interface. The bootstrap less files are compiled during the build process to allow for customisations on top of the default look and feel.


AngularJS
--
Angular provides us the concept of building service factories, controllers, etc. It also does the binding between the UI templating and the javascript logic behind it

Cordova
--
Cordova is used to package a web based application into a natively installable package. It also allows Synthesis to use native code from a web based application in a secure manner.

Updrading cordova components
---
Each of the cordova libraries and platform versions can be specified using the build configuration.
If you need to change the version of a cordova plugin, you can edit `cordova.plugins` in `build.config.js`.
If you need to change the version of a cordova platform, you can edit `cordova.platforms` in `build.config.js`.


EcmaScript 6
--
The source code is written using the ES6 standard. This code get transpiled back to ES5 which is supported by more devices.
ES6 allows you to write shorter code which makes code maintenance much easier.
Babel is used to transpile the code to ES5, and browserify takes care of packaging it all into one browser friendly package.
