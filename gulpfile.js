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
	templateCache = require('gulp-angular-templatecache'),
	htmlmin = require('gulp-htmlmin'),
	sourcemaps = require('gulp-sourcemaps'),
	replace = require('gulp-replace-task'),
	usemin = require('gulp-usemin'),
	uglify = require('gulp-uglify'),
	less = require('gulp-less'),
	minifyCss = require('gulp-clean-css'),
	rev = require('gulp-rev'),
	browserify = require('browserify'),
	buffer = require('vinyl-buffer'),
	source = require('vinyl-source-stream'),
	rimraf = require('rimraf'),
	path = require('path'),
	eslint = require('gulp-eslint'),
	gutil = require('gulp-util'),
	cordovaRun = require('cordova-lib').cordova.run,
	pumpify = require('pumpify'),
	process = require('process'),
	merge = require('merge-stream');

var argv = require('minimist')(process.argv.slice(2));

var options = {
	development : argv.development === true
};
gutil.log('Running ' + (options.development ? 'DEVELOPMENT' : 'PRODUCTION') + ' mode');


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

/**
 * Create template caches.
 * @returns {Stream} A gulp stream
 */
function runTemplateCache(){
	var sources = ['!' + srcHtml + '/index.html', srcHtml + '/**/*.html'];
	return gulp.src(sources, {base : srcHtml})
	.pipe(htmlmin({
		collapseWhitespace : true,
		removeComments : true
	}))
	.pipe(templateCache({
		standalone : true,
		module : 'synthesis.templates',
		filename : 'js/synthesis-templates.js',
		transformUrl : function(url){
			// Remove starting slash
			url = url.replace(/^\//, ''); // Linux
			url = url.replace(/^\\/, ''); // Windows
			return url;
		}
	}))
	.pipe(uglify())
	.pipe(gulp.dest(workPipeline + '/www'));
}

/**
 * Run ESlint on source code
 * @return {Steam} A gulp stream
 */
function runLint(){
	return gulp.src([srcJs + '/**/*.js', '!node_modules/**'])
		.pipe(eslint())
		.pipe(eslint.format())
		.pipe(eslint.failAfterError());
}

/**
 * Generate the SynthesisConfig.js file
 */
function createConfig(){
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
}

/**
 * Run usemin.
 * @returns {Stream} A gulp stream.
 */
function runUsemin(){
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
			less : [less(), options.development ? gutil.noop() : minifyCss()],
			css : [ rev() ],
			jsLibraries : [ options.development ? gutil.noop() : uglify(), rev()],
			jsAngular : [ options.development ? gutil.noop() : uglify(), rev()],
			jsBootstrap : [ options.development ? gutil.noop() : uglify(), rev()]
		}))
		.pipe(gulp.dest(workPipeline + '/www'));
}

function copyWebassets(){
	var streams = [];
	streams[0] = gulp.src([srcHtml + '/**', '!' + srcHtml + '/index.html'], {base : srcHtml})
		.pipe(gulp.dest(workPipeline + '/www'));

	streams[1] = gulp.src(['./bower_components/bootstrap/dist/fonts/**'], {base : './bower_components/bootstrap/dist'})
			.pipe(gulp.dest(workPipeline + '/www'));

	return merge(streams);
}

function compileJavascript(){
	var bundler = browserify({
		entries : [srcJs + '/init.js'],
		debug : options.development
	});

	var pipeline = [
		bundler.bundle(),
		source(pkg.name + '.min.js'),
		buffer(),
		options.development ? sourcemaps.init({loadMaps : true}) : gutil.noop(),
		options.development ? gutil.noop() : uglify(),
		options.development ? sourcemaps.write() : gutil.noop(),
		gulp.dest(workPipeline + '/www/js')
	];

	return pumpify(pipeline);
}


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


gulp.task('config:clean', ['cleanup-build'], createConfig);
gulp.task('js:clean', ['cleanup-build'], compileJavascript);
gulp.task('lint', runLint);
gulp.task('templates:clean', ['cleanup-build'], runTemplateCache);
gulp.task('web:clean', ['cleanup-build'], copyWebassets);
gulp.task('usemin:clean', ['cleanup-build'], runUsemin);


gulp.task('pipeline', ['js:clean', 'usemin:clean', 'web:clean', 'config:clean', 'templates:clean']);

gulp.task('default', ['pipeline']);
