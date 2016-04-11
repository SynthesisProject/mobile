var fs = require('fs'),
	path = require('path');

var cordovaAppendXml;
try{
	cordovaAppendXml = fs.readFileSync(path.resolve(__dirname, 'cordova-append.xml'), 'utf8');
}
catch(error){
	console.log('Failed to read cordova-append.xml');
	console.log(error);
	throw error;
}

module.exports = {
	'cordova' : {
		'dir' : 'cordova',
		'packageId' : 'coza.opencollab.synthesis.mobile',
		'authorName' : 'Charl Thiem',
		'authorEmail' : 'charl@opencollab.co.za',
		'xml' : cordovaAppendXml,
		'platforms' : {
			'android' : '5.1.1',
			'ios' : '4.1.0'
		},
		'plugins' : [
			'cordova-plugin-whitelist@1.2.1',
			'phonegap-plugin-push@1.3.0',
			'cordova-plugin-file@4.1.1',
			'cordova-plugin-file-transfer@1.5.0',
			'cordova-plugin-device@1.1.1',
			'cordova-plugin-inappbrowser@1.3.0',
			'cordova-plugin-statusbar@2.1.1',
			'cordova-plugin-dialogs@1.2.0',
			'cordova-plugin-disable-nsapptransportsecurity@1.0.2',
			'https://github.com/OpenCollabZA/cordova-plugin-fileopener.git'
		],
		'preferences' : {
			'fullscreen' : 'false',
			'webviewbounce' : 'false',
			'DisallowOverscroll' : 'true',
			'StatusBarOverlaysWebView' : 'false',
			'StatusBarBackgroundColor' : '#000000',
			'StatusBarStyle' : 'lightcontent'
		}
	},
	/**
	 * Base URL of the server.
	 * Do NOT include any context path or trailing slash
	 * example: http://my.server.com or http://my.server.com:8080
	 */
	'serverBaseUrl' : 'http://synthesis.opencollab.co.za',
	/**
 	 * Context path the of the Synthesis Server.
	 * This path should contain a trailing slash. if the service is hosted
	 * on the root of the server, enter only the "/" as the value
	 */
	'serverBaseContextPath' : '/synthesis-service',
	'applicationName' : 'Synthesis Mobile',
	'vendorName' : 'OPENCOLLAB',
	// URL to the vendor website
	'vendorURL' : 'http://www.opencollab.co.za',
	/*
	 * Name of the directory where synthesis will save content.
	 * This will be relative to the directory which the native device
	 * selects as a suitable location for content. It might be on a external
	 * SD card, Internal SD card, or any location the system chooses.
	 *
	 * WARNING: Never change this once in production! Students will not
	 * see the content they already downloaded, and content not uploaded
	 * yet will seem lost!
	 */
	'dataDir' : 'SynthMobile',
	/*
	 * Logging level
	 * DEBUG : 1,
	 * INFO  : 2
	 * WARN  : 3
	 * ERROR : 4
	 * NONE  : 5
	 */
	'logLevel' : 1,

	// Should we log to console
	'logToConsole' : true,

	// Should we log to file
	'logToFile' : true,

	// Max size of the log file in bytes
	'logFileSize' : 1000000,

	// Number of log files to keep
	'logFileCount' : 5,

	// Flag if push notifications are enabled for the application
	'pushEnabled' : false,

	// Sender ID for android push notifications
	'androidSenderID' : null
};
