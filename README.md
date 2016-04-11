[![Build Status](https://travis-ci.org/SynthesisProject/mobile.svg?branch=master)](https://travis-ci.org/SynthesisProject/mobile)

# Synthesis Mobile

This project is used as a client for the Synthesis Service


## Requirements

Node 4.2 or higher with gulp installed globally

`(sudo) npm install -g gulp`

[Git client ](https://git-scm.com/downloads)


## Installation
`npm install`


## Usage
Once ready to run on a device or emulator:

`gulp build-android`

`gulp build-ios`

To use developer mode you need to set an environment variable
Unix:

`export DEVELOPMENT=true; gulp build-android`

Windows:

`set DEVELOPMENT=true; gulp build-android`

## Configuration

### Server connection
You might want to change the server the application is connecting to while developing (also when creating a fork)
To do this you need to edit `config/build.config.js`
You may use any nodejs libraries you require to be able to export the config object

### Log Level
During development you might want to increase the log level.

See `config/build.config.js` - logLevel


## Development
### Source code
All source code for the application is located `src` directory
 - html, all the web assets
 - js, all the JavaScript assets
 - less, styling
 - res, icons and images



## Build process technical info
The build process is handled by gulp. It takes care of transpiling the javascript, generating a Cordova project, copying all the assets to the right places, and eventually creating an app you deploy to a device or the app store.

The javascript files are written in ES6. During the build process a babelify plugin is used to convert the files into standard ES5 commonjs files. Browserify is used to bundle these modules in a way that a website can use them.

When using development mode for your builds, your web inspector will use the sourcemaps to show you the paths to the original files (before the where converted).
