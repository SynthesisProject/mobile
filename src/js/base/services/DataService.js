'use strict';
import {convertToString} from '../Utilities';
import bases from 'bases';
/*
 * base/js/services/DataService.js
 * Create factory for the DataService
 */
var DataService = ($q, $http, $rootScope, LoggerService, SynthError, UserSession, SynthConfig, Lock, AccessPermission) => {

	var LOG = LoggerService('DataService');
	// Characters that will be used to generate filenames
	// Windows Quirks
	// - case insensitive, hense no capitals
	// - underscores are not allowed
	// No other special characters are used because to mess with sorting
	const FILENAME_CHARS = '0123456789abcdefghijklmnopqrstuvwxyz';

	// The lock key that is used when generating new file names
	const FILE_CREATE_LOCK = 'DataService.FILE_CREATE_LOCK';


	/**
	 * Constructor
	 */
	class DataServiceImpl{

		constructor(){
			this.deviceReady = false;
			// Android 6+ requires user permission to acces files
			this.hasFilePermissions = false;
			this.cachedRouteFileSystem = null;
		}

		/**
		 * Returns a promise that will be resolved when the cordova thinks
		 * the device is ready and you can use the API
		 */
		cordovaReady(){
			const deferred = $q.defer();
			if (this.deviceReady === true){
				deferred.resolve();
			}
			else{
				document.addEventListener('deviceready', () => {
					this.deviceReady = true;
					deferred.resolve();
				}, false);
			}
			return deferred.promise.then(function(){
				return AccessPermission.requestFilePermission();
			});
		}

		/**
		 * Gets the directory in which content data is stored
		 * /Synthesis/content/
		 */
		getContentDirectory (){
			return this.checkAndCreateDirectory('content');
		}

		/**
		 * /Synthesis/data/
		 */
		getDataDirectory(){
			return this.checkAndCreateDirectory('data');
		}

		/**
		 * Gets a file in the data directory
		 */
		getDataFile(filename){
			return this.getFileData('data', filename);
		}

		/**
		 * Merge json to a file in the /Synthesis/data directory
		 * @param filename Name of the file inside of /Synthesis/data/
		 * @param jsonObject The object to merge into this file
		*/
		mergeDataFile(filename, jsonObject){
			return this.mergeToFile('data', filename, jsonObject);
		}

		/**
		 * Creates a new file in the data directory of the app
		 * This file will be created in an abitrary directory under /Synthesis/data/{generatedFolder}/{filename}
		 * @param filename Name of the file to create. E.g. MyImage.png
		 * @returns A promise resolving to the FileEntry representing the file
		 */
		createNewFile(filename){
			var dataDirEntry;
			const self = this;
			function getLock(){
				return Lock.getLock(FILE_CREATE_LOCK);
			}

			function getContentDirectory(){
				return self.getContentDirectory();
			}

			/**
			 * Gets the listing of all files within the DirectoryEntry
			 * @param dirEntry Directory entry to get the contents listing of
			 * @returns A promise that resolves to an array of entries.
			 */
			function getDirectoryListing(dirEntry){
				dataDirEntry = dirEntry;
				var listingDefered = $q.defer();
				var dirReader = dataDirEntry.createReader();
				var entries = [];

				// Call the reader.readEntries() until no more results are returned.
				// TODO uptomise and only get the last directory name
				var readEntries = function() {
					dirReader.readEntries((results) =>{
						// If no more entries are found, we are done
						if (!results.length) {
							listingDefered.resolve(entries.sort((fileEntry1, fileEntry2) => {
								var name1 = fileEntry1.name, name2 = fileEntry2.name;
								if(name1.length !== name2.length){
									return name1.length - name2.length;
								}
								return name1.localeCompare(name2);
							}));
						}
						else{
							entries = entries.concat(Array.prototype.slice.call(results || [], 0));
							readEntries();
						}
					}, (error) =>{
						LOG.warn('Failed to get directory listing, code:' + error.code);
						listingDefered.reject(SynthError(1004, error.code));
					});
				};
				readEntries(); // Start reading dirs.
				return listingDefered.promise;
			}

			/**
			 * Finds the next available directory based on the array of files within the
			 * file listing
			 * @param fileListing Array of files in the contants directory
			 * @returns A name of the next available filename that can be used.
			 */
			function findNextOpenDirectory(fileListing){
				// If there is no files yet, we start with 1.ext
				if(fileListing.length === 0){
					return $q.when(FILENAME_CHARS.charAt(0));
				}
				// Else we take the last file in the list, and get the next available name
				else {
					// Get the file name
					var lastDirectoryName = fileListing[fileListing.length - 1].name;
					var index = bases.fromAlphabet(lastDirectoryName, FILENAME_CHARS);
					var newDirectoryName = bases.toAlphabet(index + 1, FILENAME_CHARS);
					return $q.when(newDirectoryName);
				}
			}

			/**
			 * Creates the new directory
			 * @param directoryName Name of the directory to create
			 * @returns A promise that resolves with the DirectoryEntry
			 */
			function createNewDirectory(directoryName){
				var deferred = $q.defer();
				dataDirEntry.getDirectory(directoryName, {create : true, exclusive : true}, (dirEntry) => {
					deferred.resolve(dirEntry);
				},
				// Error Creating directory
				(error) => {
					LOG.warn(`Error creating path ${directoryName} : ${error}`);
					deferred.reject(SynthError(1004, error));
				});
				return deferred.promise;
			}

			function createFile(directoryEntry){
				var deferred = $q.defer();
				directoryEntry.getFile(filename, {create : true},
					(fileEntry) => {
						LOG.debug('Created new file: ' + fileEntry.toInternalURL());
						deferred.resolve(fileEntry);
					},
					() => {
						LOG.warn('Failed to create file');
						deferred.reject(SynthError(1004));
					}
				);
				return deferred.promise;
			}

			return getLock()
				.then(getContentDirectory)
				.then(getDirectoryListing)
				.then(findNextOpenDirectory)
				.then(createNewDirectory)
				.then(createFile)
				.then((returnData) => {
					return Lock.returnLock(FILE_CREATE_LOCK, returnData);
				}, (reason) =>{
					return Lock.returnLock(FILE_CREATE_LOCK, reason, false);
				});
		}


		/**
		 * Gets the root directory where the application is writing files
		 */
		getApplicationRoot(){
			const deferred = $q.defer();
			// TODO remove the false!
			// if (false && this.cachedRouteFileSystem !== null){
			//deferred.resolve(this.cachedRouteFileSystem);
			//}
			//else {
			var self = this;
			this.cordovaReady().then(() => {
				window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, gotFS, fail);
				function gotFS(fileSystem) {
					fileSystem.root.getDirectory(SynthConfig.dataDir, {create : true, exclusive : false},
						(directory) => {
							self.cachedRouteFileSystem = directory;
							deferred.resolve(directory);
						}, (error) => {
							LOG.warn('Failed to get application root : ' + error);
							deferred.reject(SynthError(1004, error.code));
						}
					);
				}
				function fail(error) {
					LOG.warn('Failed to get filesystem, code:' + error.code);
					deferred.reject(SynthError(1004, error.code));
				}
			});
			//}
			return deferred.promise;
		}

		/**
		 * Checks if the specified path exists, and creates all parent directories
		 * if required.
		 * The path is created from the root of the application path
		 */
		checkAndCreateDirectory(path){
			const deferred = $q.defer();
			this.getApplicationRoot().then(
				function(root){

					// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
					function removeBlanks(folders){
						if (folders.length > 0 && (folders[0] === '.' || folders[0] === '')) {
							folders = folders.slice(1);
							return removeBlanks(folders); // Call again to check the next one too
						}
						else{
							return folders;
						}
					}

					function createDir (rootDirEntry, folders){
						folders = removeBlanks(folders);

						// If there are no more folders left, this is it
						if (folders.length === 0){
							deferred.resolve(rootDirEntry);
							return;
						}

						var folder = folders[0];
						let foldersLeft = folders.slice(1);
						//LOG.debug('Creating directory : ' + folder + ' in parent: ' + rootDirEntry.fullPath);
						rootDirEntry.getDirectory(folder, {create : true, exclusive : false}, (dirEntry) => {
							// Recursively add the new subfolder (if we still have another to create).
							if (foldersLeft.length > 0) {
								createDir(dirEntry, foldersLeft);
							}
							else{
								deferred.resolve(dirEntry);
							}
						},
						// Error Creating directory
						(error) => {
							LOG.warn(`Error creating path ${path} : ${error}`);
							deferred.reject(SynthError(1004, error));
						});
					}
					var rootPath = `cdvfile://localhost/persistent/${SynthConfig.dataDir}`;
					if(path.indexOf(rootPath) === 0){
						path = path.substring(rootPath.length);
					}

					createDir(root, path ? path.split('/') : []);
				});
			return deferred.promise;
		}

		/**
		 * Gets the full path of the root directory.
		 * The success of the promise will return a string of the full path
		 * to the application root directory.
		 */
		getLocalFilePath(){
			const deferred = $q.defer();
			this.getApplicationRoot().then(
				// Success
				(root) => {
					deferred.resolve(root.fullPath);
				},
				// Failed
				(error) => {
					deferred.reject(SynthError(1004, error));
				}
			);
			return deferred.promise;
		}

		/**
		 * Writes to the data file of a tool.
		 * NOTE: This function will replace the current data file of the tool
		 *
		 * @param moduleId - Id of the module this tool is in.
		 * @param toolname - Name of the tool to write data to.
		 * @param jsonData - Either a JSON Object, or a JSON string that represents the data
		 * that should be written to the tool's data file
		 * @param isUploadData - Flag if the data is for the upload file of the tool (optional, default=false)
		 */
		writeToolData(moduleId, toolname, jsonData, isUploadData){
			const deferred = $q.defer();
			this.getDataDirectory().then(
				// Success
				function(root){
					var filename = moduleId + '-' + toolname + (isUploadData ? '.up.json' : '.json');
					root.getFile(filename, {create : true, exclusive : false},
						(fileEntry) => {
							fileEntry.createWriter(onWriterReady, fail);
						}, fail);

					function onWriterReady(writer) {
						writer.onwriteend = function() {
							deferred.resolve();
						};

						var dataString = convertToString(jsonData);
						if (dataString != null){
							writer.write(dataString);
						}
						else{
							LOG.warn('Failed while trying to write tool data, Invalid data type given to write as tool data');
							deferred.reject(SynthError(1000, 'Invalid data type given to write as tool data'));
						}
					}
					/**
					 * Function for when an IO action fails
					 */
					function fail(error) {
						LOG.warn('Failed while trying to write tool data, error : ' + error);
						deferred.reject(SynthError(1004));
					}
				},
				// Fail
				function(){
					deferred.reject();
				}
			);
			return deferred.promise;
		}

		/**
		 * Write content to a file
		 *
		 * @param directoryPath - Path of the directory to write in.
		 * @param filename - Name of the file to write in.
		 * @param data - Data to write to the file. The data can be a string or a JSON object
		 * which will be converted to a json string.
		 */
		writeToFile(directoryPath, filename, data){
			const self = this;

			function writeFile(directory){
				var writeDeferred = $q.defer();
				directory.getFile(filename, {create : true, exclusive : false},
					(fileEntry) => {
						fileEntry.createWriter(onWriterReady, fail);
					}, fail);

				// Writer is ready to write
				function onWriterReady(writer) {
					writer.onwriteend = function() {
						writeDeferred.resolve(data);
						self.busyWriting = false;
					};
					var outputData = convertToString(data);
					writer.write(outputData);
				}
				// Function for when an IO action fails
				function fail(error) {
					LOG.warn('Failed while trying to write to file, error: ' + error);
					writeDeferred.reject(SynthError(1004));
				}
				return writeDeferred.promise;
			}


			return this.checkAndCreateDirectory(directoryPath).then(
				// Success getting directory path
				function(directory){
					// First get a write lock on the file
					return Lock.getLock(`${directoryPath}${filename}`)
					// Now write to the file
						.then(() => {
							return writeFile(directory);
						})
					// Return our lock on the file
						.then((writtenData) => {
							return Lock.returnLock(`${directoryPath}${filename}`, writtenData);
						}, (reason) => {
							return Lock.returnLock(`${directoryPath}${filename}`, reason, false);
						});
				},
				// Failed to get directory path
				function(error){
					LOG.warn('Failed while trying to write to file, error: ' + error);
					return $q.reject(SynthError(1004));
				});
		}

		/**
		 * Copies content from the web to a file
		 */
		copyFromWebToFile(webPath, directoryPath, filename){
			const deferred = $q.defer(),
				self = this;
			this.getWebData(webPath).then(
				// Success
				(data) => {
					copyDataToFile(data);
				},
				// Failed
				(error) => {
					LOG.warn('Failed to get web data : ' + error);
					deferred.reject(SynthError(1004));
				});
			// Function to copy the web data to the file
			function copyDataToFile(data){
				self.writeToFile(directoryPath, filename, data).then(
					// Success
					() => {
						deferred.resolve();
					},
					// Failed
					(error) => {
						LOG.warn('Failed while trying to copy file from web, error: ' + error);
						deferred.reject(SynthError(1004));
					}
				);
			}
			return deferred.promise;
		}

		/**
		 * Merge content to a file.
		 * The newly merged data object is returned
		 */
		mergeToFile(directoryPath, filename, jsonObject){
			const deferred = $q.defer(),
				self = this;
			// Get the original contents of the file
			this.getFileData(directoryPath, filename).then(
				// Success
				(data) => {
					// Merge the new data to the old data
					let writeData = angular.merge(data, jsonObject);


					// Write the merged data to the file
					self.writeToFile(directoryPath, filename, JSON.stringify(writeData)).then(
						// Success
						() => {
							deferred.resolve(writeData);
						},
						//Fail
						(error) => {
							deferred.reject(error);
						}
					);
				},
				//Fail
				function (error){
					deferred.reject(error);
				}
			);
			return deferred.promise;
		}

		/**
		 * Gets the directory in which a tool lives
		 TODO Use another way to find files!
		getFileInToolData(moduleId, toolname, filepath){
			const deferred = $q.defer();
			this.getDataDirectory(moduleId, toolname).then(
				// Success
				(dirEntry) => {
					dirEntry.getFile(filepath, {create : false},
						(fileEntry) => {
							var reader = new FileReader();
							reader.onloadend = function(evt) {
								LOG.debug(evt.target.result);
								deferred.resolve(evt.target.result);
							};

							fileEntry.file((file) => {
								reader.readAsDataURL(file);
							},
							() => {
								LOG.warn('Failed to get file from file entry');
								deferred.reject(SynthError(1004));
							});
						},
						() => {
							LOG.warn('Fail while trying to get file in directory');
							deferred.reject(SynthError(1004));
						}
					);
				},
				//Fail
				(error) => {
					deferred.reject(error);
				}
			);
			return deferred.promise;
		}
		 */

		/**
		 * Get data from a web json source
		 */
		getWebData(webPath){
			return $http({ 'method' : 'GET', 'url' : webPath})
				.then((response) => {
					return response.data;
				}, () => {
					return $q.reject(SynthError(1004));
				});
		}

		/**
		 * Gets the JSON object from a file
		 */
		getFileData(directoryPath, filename){
			LOG.debug('Getting data for: directroy=' + directoryPath + ', filename=' + filename);
			const deferred = $q.defer(),
				self = this;
			this.checkAndCreateDirectory(directoryPath).then(
				// Success
				(directory) => {
					directory.getFile(filename, {create : true},
						(fileEntry) => {
							self.getFileAsObject(fileEntry).then(
								// Success
								(object) => {
									if(LOG.isDEBUG()){
										LOG.debug('Got data :' + JSON.stringify(object));
									}
									deferred.resolve(object);
								},
								// Fail
								(error) => {
									deferred.reject(error);
								}
							);
						},
						() => {
							LOG.warn('Fail while trying to get file in directory');
							deferred.reject(SynthError(1004));
						}
					);

				},
				// Failed
				(error) => {
					deferred.reject(error);
				});
			return deferred.promise;
		}

		/**
		 * Make sure the files exists that prevent the device from scanning for library
		 * content in the Application directory
		 */
		ensureNoMediaScanFiles(){
			return this.writeToFile('', '.nomedia');
		}


		/**
		 * Gets the size of the upload data
		 */
		getToolUploadDataSize(moduleId, toolname){
			const deferred = $q.defer();
			this.getDataDirectory().then(
				// Success
				(toolRoot) => {
					const filename = `${moduleId}-${toolname}.up.json`;
					/*
					 * TODO do we have to create the file ?!
					 * This will cause each tool to have an upload file
					 * even will it will always be empty, the file will get
					 * created when checking for sync
					 */
					toolRoot.getFile(filename, {create : true},
						(fileEntry) => {
							fileEntry.file(
								(file) => {
									deferred.resolve(file.size);
								}, fail);

						}, fail
					);
				}, fail
			);

			function fail(error){
				deferred.reject(error);
			}

			return deferred.promise;
		}

		/**
		 * Delete the upload data file for a tool
		 */
		deleteToolUploadData(moduleId, toolname){
			const deferred = $q.defer();
			this.getToolDataFile(moduleId, toolname, true).then(
				// Success
				(fileEntry) => {
					fileEntry.remove(
						() => {
							deferred.resolve();
						},
						() => {
							LOG.warn('Error deleting upload file');
							deferred.reject(SynthError(1004, 'Error deleting upload file'));
						});
				},
				//Fail
				(error) => {
					deferred.reject(error);
				}
			);
			return deferred.promise;
		}

		/**
		 * Deletes a file in the contents directory
		 */
		deleteCDVFile(cdvFilePath){
			const deferred = $q.defer();
			LOG.warn('Going to delete file: ' + cdvFilePath);
			window.resolveLocalFileSystemURL(cdvFilePath,
				// Got the local file
				function(fileEntry){
					fileEntry.remove(() => {
						deferred.resolve();
					}, (error) => {
						LOG.warn('Failed to delete file : ' + cdvFilePath);
						deferred.reject(error);
					});
				},
				// Failed to get the file
				() => {
					LOG.warn('Error getting file to delete: ' + cdvFilePath + ', assuming file is already deleted.');
					deferred.resolve();
				});
			return deferred.promise;
		}

		/**
		 * Deletes an array of files
		  @param deleteFiles Array of cdv:// file protocal file path
		 */
		deleteCDVFiles(filePaths = []){
			let promise = $q.when();
			const self = this;
			angular.forEach(filePaths, function(filePath){
				promise = promise.then(function(){
					return self.deleteToolFile(filePath);
				});
			});
			return promise;
		}

		/**
		 * Gets the file entry for a tool's data file
		 * @param moduleId - ID of the module for the tool
		 * @param toolname - Name of the tool to get data file of
		 * @param isUploadData - Flag if the data file should be the upload file
		 */
		getToolDataFile(moduleId, toolname, isUploadData){
			const deferred = $q.defer();
			this.getDataDirectory().then(
				// Success
				(toolRoot) => {
					var filename = moduleId + '-' + toolname + (isUploadData ? '.up.json' : '.json');
					toolRoot.getFile(filename, {create : true},
						(fileEntry) => {
							deferred.resolve(fileEntry);
						},
						(error) => {
							LOG.warn('Error getting tool data file, error: ' + error);
							deferred.reject(SynthError(1004));
						}
					);
				},
				//Fail
				(error) => {
					deferred.reject(error);
				}
			);
			return deferred.promise;
		}

		getFileContentCDV(cdvFilePath){
			const deferred = $q.defer();

			window.resolveLocalFileSystemURL(cdvFilePath,
				// Got the local file
				function(fileEntry){
					fileEntry.file((file) => {
						var reader = new FileReader();
						reader.onloadend = function (evt) {
							deferred.resolve(evt.target.result);
						};
						reader.readAsText(file);
					}, () => {
						deferred.reject(SynthError(1004));
					});
				},
				// Failed to get the file
				() => {
					deferred.reject(SynthError(1004));
				});
			return deferred.promise;
		}

		/**
		 * Get the contents of a file without any special conversions
		 */
		getFileContent(toolId, moduleId, filePath){
			const self = this;
			var dataDir = null;
			// Returns a promise to get the tools data dir
			function getToolDataDirPromise(){
				return self.getDataDirectory(moduleId, toolId)
					.then((dir) => {
						dataDir = dir;
					});
			}

			// Returns a promise to get the content of the file
			function getContentPromise(){
				const deferred = $q.defer();
				LOG.debug('Getting content of file: ' + dataDir.nativeURL + '/' + filePath);
				dataDir.getFile(filePath, null,
					// Got file
					function(fileEntry){
						fileEntry.file((file) => {
							var reader = new FileReader();
							reader.onloadend = function (evt) {
								deferred.resolve(evt.target.result);
							};

							reader.readAsText(file);
						}, () => {
							deferred.reject(SynthError(1004));
						});
					},
					// Failed to get file
					() => {
						deferred.reject(SynthError(1004));
					});
				return deferred.promise;
			}

			return getToolDataDirPromise()
				.then(getContentPromise);
		}

		/**
		 * Gets a file as an object
		 */
		getFileAsObject(fileEntry){
			const deferred = $q.defer();
			fileEntry.file((file) => {
				var reader = new FileReader();
				reader.onloadend = function (evt) {
					if (evt.target.result === ''){
						deferred.resolve({});
					}
					else{
						try {
							LOG.debug('File content for ' + fileEntry.toURL());
							LOG.debug(evt.target.result);
							deferred.resolve(angular.fromJson(evt.target.result));
						}
						catch(e){
							LOG.warn('Failed to create object from json string : \n' + evt.target.result);
							deferred.reject(SynthError(1004));
						}
					}
				};
				reader.readAsText(file);
			}, fail);

			function fail(error) {
				LOG.warn('Failed getting file as object, error : ' + error);
				deferred.reject(SynthError(1004, error));
			}
			return deferred.promise;
		}

		/**
		 * Checks if a file exist
		 */
		doesFileExist(filePath){
			const deferred = $q.defer();
			this.getApplicationRoot().then(
				// Success
				function(fileSystem){
					fileSystem.getFile(filePath, { create : false },
						// It exists
						() => {
							deferred.resolve(true);
						},
						// It does not exist
						() => {
							deferred.resolve(false);
						});
				},
				// Failed
				(error) => {
					deferred.reject(error);
				}
			);

			return deferred.promise;
		}

		/**
		 * This method will delete ALL application data from the user's device.
		 */
		deleteAllApplicationData(){
			const deferred = $q.defer();
			UserSession.clearSession();
			this.getApplicationRoot().then(
				// Success
				(dataDirectoryEntry) => {
					dataDirectoryEntry.removeRecursively(
						() => {
							// Broadcast that all caches should be cleared
							$rootScope.$broadcast('app.clearAllCache');
							deferred.resolve();
						},
						() => {
							deferred.reject(SynthError(1004, 'Error deleting all aplication data'));
						});
				},
				// Failed
				(error) => {
					deferred.reject(error);
				});

			return deferred.promise;
		}

	}

	return new DataServiceImpl();
};
DataService.$inject = ['$q', '$http', '$rootScope', 'LoggerService', 'SynthError', 'UserSession', 'SynthConfig', 'Lock', 'AccessPermission'];
export default DataService;
