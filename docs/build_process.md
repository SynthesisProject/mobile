# Build Process
The build process is handled by gulp. It takes care of transpiling the javascript, generating a Cordova project, copying all the assets to the right places, and eventually creating an app you deploy to a device or the app store.

The javascript files are written in ES6. During the build process a babelify plugin is used to convert the files into standard ES5 commonjs files. Browserify is used to bundle these modules in a way that a website can use them.

When using development mode for your builds, your web inspector will use the sourcemaps to show you the paths to the original files (before the where converted).
