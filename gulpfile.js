'use strict';

var gulp = require('gulp'),
	pkg = require('./package.json'),
	buildConfig = require('./config/build.config'),
	fs = require('fs'),
// Cordova
	create = require('gulp-cordova-create'),
	plugin = require('gulp-cordova-plugin'),
	android = require('gulp-cordova-build-android'),
	ios = require('gulp-cordova-build-ios'),
	windows = require('gulp-cordova-build-windows'),
	access = require('gulp-cordova-access'),
	author = require('gulp-cordova-author'),
	description = require('gulp-cordova-description'),
	version = require('gulp-cordova-version'),
	xml = require('gulp-cordova-xml'),
	pref = require('gulp-cordova-preference'),
// gulp plugins
	replace = require('gulp-replace-task'),
	concat = require('gulp-concat'),
	usemin = require('gulp-usemin'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	minifyCss = require('gulp-minify-css'),
	rev = require('gulp-rev'),
	browserify = require('browserify'),
	buffer = require('vinyl-buffer'),
	source = require('vinyl-source-stream'),
	rimraf = require('rimraf'),
	path = require('path'),
	eslint = require('gulp-eslint'),
	gutil = require('gulp-util'),
	cordovaRun = require('cordova-lib').cordova.run,
	process = require('process'),
	path = require('path');

var DEVELOPMENT = !!process.env.DEVELOPMENT && (process.env.DEVELOPMENT.indexOf('true') == 0);

// Directories where sources come from
var src = __dirname + '/src';
var srcHtml = src + '/html';
var srcJs = src + '/js';

var tempDir = __dirname + '/.work';
// Working directory for the pipeline
var workPipeline = tempDir + '/pipeline';

// Working directory for Cordova
var workCordova = buildConfig.cordova.dir;

// Where distriution binaries should be placed
var dstBinaries = __dirname + '/dist';

gulp.task('clean-cordova', function (cb) {
	rimraf(buildConfig.cordova.dir, cb);
});


gulp.task('cleanup-build', function(cb) {
	rimraf(workPipeline, cb);
});

gulp.task('lint', function () {
	return gulp.src([srcJs + '/**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
});

/**
 * Generate the SynthesisConfig.js file
 */
gulp.task('generate-config', ['cleanup-build'], function() {
	var configHeader = 'angular.module(\'synthesis.config\',[]).constant("SynthConfig",';
	var configFooter = ');';
	var configObject = {
		'applicationName' : buildConfig.applicationName,
		'vendorName' : buildConfig.vendorName,
		'vendorURL' : buildConfig.vendorURL,
		'dataDir' : buildConfig.dataDir,
		'logLevel' : buildConfig.logLevel,
		'logToConsole' : buildConfig.logToConsole,
		'logToFile' : buildConfig.logToFile,
		'logFileSize' : buildConfig.logFileSize,
		'logFileCount' : buildConfig.logFileCount,
		'baseURL' : buildConfig.serverBaseUrl + buildConfig.serverBaseContextPath,
		'pushEnabled' : buildConfig.pushEnabled,
		'androidSenderID' : buildConfig.androidSenderID,
		'toolMapping' : {}
	};
	// make a new stream with fake file name
	var stream = source('synthesis-config.js');
	// write the file contents to the stream
	stream.write(configHeader);
	stream.write(JSON.stringify(configObject));
	stream.write(configFooter);
	stream.end();
	stream.pipe(gulp.dest(workPipeline + '/www/js'));
});

gulp.task('usemin', ['lint', 'cleanup-build'], function() {
	return gulp.src(srcHtml + '/index.html')
		.pipe(replace({
			patterns : [
				{
					match : 'SERVER_URL',
					replacement : buildConfig.serverBaseUrl
				},
				{
					match : 'PKG_NAME',
					replacement : pkg.name
				},
				{
					match : 'APP_NAME',
					replacement : buildConfig.applicationName
				}
			]
		}))
		.pipe(usemin({
			less : [less/*, minifyCss, concat*/],
			css : [ rev() ],
			//html : [ DEVELOPMENT ? gutil.noop() : minifyHtml({ empty : true }) ],
			js : [ rev ],
			inlinejs : [ uglify ],
			inlinecss : [ minifyCss, concat ]
		}))
		.pipe(gulp.dest(workPipeline + '/www'));
});

gulp.task('copy-html', ['cleanup-build'], function(){
	return gulp.src([srcHtml + '/**', '!' + srcHtml + '/index.html'], {base : srcHtml})
		.pipe(gulp.dest(workPipeline + '/www'));
});

gulp.task('copy-bootstrap-assets', ['cleanup-build'], function(){
	return gulp.src(['./bower_components/bootstrap/dist/fonts/**'], {base : './bower_components/bootstrap/dist'})
		.pipe(gulp.dest(workPipeline + '/www'));
});

gulp.task('pipeline', ['usemin', 'copy-html', 'generate-config', 'copy-bootstrap-assets'], function () {
	return browserify(srcJs + '/init.js', { debug : DEVELOPMENT })
		.bundle()
		.on('error', function (err) {
			throw new gutil.PluginError(pkg.name, 'Error while compiling application scripts : ' + err);
		})
		.pipe(source(pkg.name + '.min.js'))
		.pipe(buffer())
		.pipe(DEVELOPMENT ? gutil.noop() : uglify())
		.pipe(gulp.dest(workPipeline + '/www/js'));
});


function createCordova(){
	//
	var additionalXmls = [];
	function appendXml(filePath){
		if(filePath != null){
			var xmlContent = fs.readFileSync(filePath, 'utf8');
			additionalXmls.push(xmlContent);
		}
	}

	appendXml(buildConfig.cordova.iconsAndroidXml);
	appendXml(buildConfig.cordova.iconsIosXml);
	appendXml(buildConfig.cordova.iconsWindowsXml);

	return gulp.src(workPipeline + '/www')
		.pipe(create({
			dir : workCordova,
			id : buildConfig.cordova.packageId,
			name : buildConfig.applicationName
		}))
		.pipe(version(pkg.version))
		.pipe(author(buildConfig.cordova.authorName, buildConfig.cordova.email))
		.pipe(description(pkg.description))
		.pipe(pref(buildConfig.cordova.preferences))
		.pipe(access('*', false))
		.pipe(access(buildConfig.serverBaseUrl + '/*'))
		.pipe(access('cdvfile://*'))
		.pipe(plugin(buildConfig.cordova.plugins))
		.pipe(xml(additionalXmls))
		.pipe(xml('<allow-navigation href="' + buildConfig.serverBaseUrl + '/*" />'));
}

gulp.task('build-android', ['clean-cordova', 'pipeline'], function() {
	var androidConfig = {
		version : buildConfig.cordova.platforms.android
	};
	androidConfig.storeFile = buildConfig.cordova.android.storeFile || undefined;
	androidConfig.keyAlias = buildConfig.cordova.android.keyAlias || undefined;
	androidConfig.storePassword = buildConfig.cordova.android.storePassword || undefined;
	androidConfig.keyPassword = buildConfig.cordova.android.keyPassword || undefined;
	return createCordova().pipe(android(androidConfig))
	.pipe(gulp.dest(dstBinaries));
});

gulp.task('build-ios', ['clean-cordova', 'pipeline'], function() {
	return createCordova()
		.pipe(ios({
			version : buildConfig.cordova.platforms.ios,
			reAdd : true
		}));
		// No dest, the ios plugin can't currently export a file
});

gulp.task('build-windows', ['clean-cordova', 'pipeline'], function() {
	return createCordova()
		.pipe(windows({
			version : buildConfig.cordova.platforms.windows,
			reAdd : true
		}));
		// No dest, the ios plugin can't currently export a file
});

/**
 * This task should always be the last in a chain as it does not pipe properly
 */
gulp.task('run-android', ['build-android'], function() {
	process.env.PWD = __dirname + path.sep + buildConfig.cordova.dir;
	cordovaRun('android');
});

gulp.task('run-ios', ['build-ios'], function() {
	process.env.PWD = __dirname + path.sep + buildConfig.cordova.dir;
	cordovaRun('ios');
});


gulp.task('default', ['cordova-android']);
