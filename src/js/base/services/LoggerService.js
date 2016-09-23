'use strict';
/*
 * base/js/services/services.LoggerService.js
 */
var LoggerService = ($q, $log, $injector, SynthConfig) => {
// Map of loggers created
	const loggers = {};

	// Contants for log levels
	const LEVELS = {
		'DEBUG' : 1,
		'INFO' : 2,
		'WARN' : 3,
		'ERROR' : 4,
		'NONE' : 5
	};

	// Set the current log level from the SynthConfig
	var logLevel = SynthConfig.logLevel;

	// Should we log to console
	var logToConsole = SynthConfig.logToConsole;

	// Should we log to a file
	var logToFile = SynthConfig.logToFile;

	// Number of log files to keep
	var numFiles = SynthConfig.logFileCount;

	/**
	 * TODO remove this, device will be ready before angular starts
	 */
	function cordovaReady(){
		return $q.when();
	}

	/**
	 * Get the directory entry where the logs are stored
	 */
	function getLogsDirectory(){
		return cordovaReady()
			.then(function(){
				var defer = $q.defer();
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);

				function gotFS(fileSystem) {
					fileSystem.root.getDirectory(SynthConfig.dataDir, {create : true, exclusive : false},
						function(directory){
							defer.resolve(directory);
						}, fail
					);
				}
				function fail(error) {
					$log.warn('LoggerService: Failed to get filesystem, code:' + error.code);
					defer.reject(error);
				}
				return defer.promise;
			})
			// Ensure log directory exists
			.then(function(rootDirectoryEntry){
				var defer = $q.defer();
				rootDirectoryEntry.getDirectory('logs', {create : true}, function(dirEntry) {
					defer.resolve(dirEntry);
				});
				return defer.promise;
			});
	}

	/**
	 * Gets a log entry for the specified logfile name
	 */
	function getLogFileEntry(logFileName){
		return getLogsDirectory()
			// Get the log file
			.then(function(logDirEntry){
				var defer = $q.defer();
				logDirEntry.getFile(logFileName, {create : true},
					function(fileEntry){
						defer.resolve(fileEntry);
					},
					function(error){
						defer.reject(error);
					}
				);
				return defer.promise;
			});
	}

	/**
	 * Removes the last log file
	 */
	function removeFileLastLog(){
		const defer = $q.defer();
		getLogFileEntry('log.' + numFiles + '.txt')
			.then(function(fileEntry){
				fileEntry.remove(function(){
					defer.resolve();
				},
					function(error){
						defer.reject(error);
					});
			});
		return defer.promise;
	}

	function shiftLog(idx){
		const defer = $q.defer();

		function fail(error){
			defer.reject(error);
		}

		getLogFileEntry('log.' + idx + '.txt')
			.then(function(fileEntry){
				fileEntry.getParent(function(parentEntry){
					// move the directory to a new directory and rename it
					fileEntry.moveTo(parentEntry, 'log.' + (idx + 1) + '.txt', function(newEntry){
						defer.resolve(newEntry);
					}, fail);
				}, fail);
			});
		return defer.promise;
	}

	/**
	 * Rotate the log files
	 */
	function rotateLogs(){
		function getShiftLogPromise(){
			/*eslint no-loop-func: "off"*/
			let promise = $q.when();
			for(var idx = numFiles - 1; idx >= 0; idx--){
				promise = promise.then(function(){
					return shiftLog(idx);
				});
			}
			return promise;
		}

		function getNewLogPromise(){
			return getLogFileEntry('log.0.txt');
		}

		// Delete last log file
		return removeFileLastLog()
			// Shift remaining files
			.then(getShiftLogPromise)
			.then(getNewLogPromise);
	}

	/**
	 * Get the log file entry
	 */
	function initService(){
		rotateLogs().then((newFileEntry) => {
			return newFileEntry;
		});
	}

	function writeToFile(logString){
		getLogFileEntry('log.0.txt').then((logFileEntry) => {
			var defer = $q.defer();
			logFileEntry.createWriter(onWriterReady, fail);

			// Writer is ready to write
			function onWriterReady(writer) {
				writer.onwriteend = function() {
					defer.resolve();
				};
				// Seek to the endo of the file
				writer.seek(writer.length);
				writer.write(logString + '\n');
			}
			// Function for when an IO action fails
			function fail(error) {
				$log.warn('Failed while trying to write to file, error: ' + error);
				defer.reject(error);
			}
			return defer.promise;
		});
	}

	/**
	 * Constructor
	 */
	class LoggerServiceImpl{

		constructor(name){
			this.name = name;
			this.levels = LEVELS;
		}

		debug(message){
			if (this.isDEBUG()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + this.name + ' (DEBUG) : ' + message;
				/*eslint-disable*/
				logToConsole && $log.log(logString);
				logToFile && writeToFile(logString);
				/*eslint-enable*/
			}
		}

		warn(message){
			if (this.isWARN()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + this.name + ' (WARN) : ' + message;
				/*eslint-disable*/
				logToConsole && $log.warn(logString);
				logToFile && writeToFile(logString);
				/*eslint-enable*/
			}
		}

		info(message){
			if (this.isINFO()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + this.name + ' (INFO) : ' + message;
				/*eslint-disable*/
				logToConsole && $log.info(logString);
				logToFile && writeToFile(logString);
				/*eslint-enable*/
			}
		}

		error(message){
			if (this.isERROR()){
				var logString = moment().format('YYYY-MM-DD HH:mm:ss') + ' ' + this.name + ' (ERROR) : ' + message;
				/*eslint-disable*/
				logToConsole && $log.error(logString);
				logToFile && writeToFile(logString);
				/*eslint-enable*/
			}
		}

		/**
		 * Returns true if ERROR level should be logged
		 */
		isERROR(){
			return logLevel <= LEVELS.ERROR;
		}

		/**
		 * Returns true if INFO should be logged
		 */
		isINFO(){
			return logLevel <= LEVELS.INFO;
		}

		/**
		 * Returns true if WARN should be logged
		 */
		isWARN(){
			return logLevel <= LEVELS.WARN;
		}

		/**
		 * Returns true if DEBUG should be logged
		 */
		isDEBUG(){
			return logLevel <= LEVELS.DEBUG;
		}

	}

	var systemLogger = new LoggerServiceImpl('SYSTEM');

	// Replace console.log with system logger
	/*eslint-disable*/
	window.console.log 				= function(message){systemLogger.debug(message);};
	window.console.warn 			= function(message){systemLogger.warn(message);};
	window.console.error			= function(message){systemLogger.error(message);};
	window.console.info				= function(message){systemLogger.info(message);};
	/*eslint-enable*/
	window.console.exception		= window.console.log;
	window.console.trace 			= window.console.log;
	window.console.group 			= window.console.log;
	window.console.groupCollapsed	= window.console.log;

	//------------------------------------------------------------------------------
	window.console.table = function(data) {
		console.log('%o', data);
	};

	// Initialise this service by rotating previous logs
	initService();
	return function(name){
		if (loggers[name] === undefined){
			loggers[name] = new LoggerServiceImpl(name);
		}
		return loggers[name];
	};

};
LoggerService.$inject = ['$q', '$log', '$injector', 'SynthConfig'];
export default LoggerService;
