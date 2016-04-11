'use strict';

// TODO all the rest calls should move to SynthesisRESTClient
var SyncAPIService = ($q, $http, $filter, $rootScope, base64, DataService,
	LoggerService, SynthError, _SF, CheckError,
	SynthConfig, SynthQLoop, ModuleService, RegistrationService, SynthAttachmentMiner,
	SynthEmbeddedImageHandler, SynthDeleteHandler, SynthLinkHandler, SynthUploadResponseHandler) => {

	var LOG = LoggerService('SyncAPIService');


	function mapTool(toolname){
		//LOG.debug('Getting mapped name for : ' + toolname + ' : ' + TOOLMAP[toolname] || toolname);
		return SynthConfig.toolMapping[toolname] || toolname;
	}

	/**
	 * Constructor
	 */
	function SyncAPIServiceImpl(){
	}


	/**
	 * Get the offline sync status for a specific tool
	 * Resolves with an object:
	 *
	 * {
			'toolId' : 'resources',
			'moduleId' : 'biology',
			'contentUploadSize' : 1024,
			'contentDownloadSize' : 1024,
			'total' : 0,
			'inSync': false,
			'label': 'Announcement'
		}
	 */
	SyncAPIServiceImpl.prototype.getSyncStatusToolOffline = function(moduleId, toolId){
		var self = this,
			syncStatus = {
				'toolId' : toolId,
				'moduleId' : moduleId,
				'contentUploadSize' : 0,
				'contentDownloadSize' : 0,
				'total' : 0,
				'inSync' : true,
				'label' : null
			};

		return ModuleService.getModuleData(moduleId).then((moduleData) => {
			var toolLocal = moduleData.toolsLocal[toolId];
			var toolRemote = moduleData.tools[toolId];
			syncStatus.label = moduleData.toolDescriptions[toolId].label;

			// If there is no remote entry for the tool, we don't know if its out of sync. Lets assume it's out
			if (toolRemote == null){

				syncStatus.inSync = false;
				syncStatus.contentDownloadSize = 0; // We actually don't know the size
			}
			// Check for content download
			else if(toolLocal.clientContentVersion !== toolRemote.currentContentVersion){
				syncStatus.contentDownloadSize = toolRemote.contentSynchSize;
				syncStatus.inSync = false;
			}

			// Check for local change
			return self.getToolUploadSize(moduleId, toolId).then((size) => {
				if(size !== 0){
					syncStatus.contentUploadSize = size;
					syncStatus.inSync = false;
				}

				// Add up the totals for download and upload
				syncStatus.total = syncStatus.contentDownloadSize + syncStatus.contentUploadSize;

				return syncStatus;
			});

		});

	};

	/**
	 * Get the offline sync status for a ALL modules without going online
	 * Resolves with an object:
	 *
	 * {
			'inSync' : true,
			'contentDownloadSize': 0,
			'contentUploadSize': 0,
			'total': 0,
			'modules': {
				'biology' : {
					'inSync' : true,
					'contentDownloadSize': 0,
					'contentUploadSize': 0,
					'total': 0,
					'tools' : {
						'resources' : {
							'toolId' : 'resources',
							'moduleId' : 'biology',
							'contentDownloadSize' : 1024,
							'contentUploadSize' : 1024,
							'inSync': false,
							'label': 'Announcement'
						}
					}
				}

			}
		}
	 */
	SyncAPIServiceImpl.prototype.getSyncStatusModulesOffline = function(){
		var modules, // Array of modules we have to get statuses for
			self = this,
			syncStatus = {
				'inSync' : true,
				'contentDownloadSize' : 0,
				'contentUploadSize' : 0,
				'total' : 0,
				'modules' : {}
			},
			idx = 0;

		/**
		 * Returns a promise to get the Sync Status of the next module in a list.
		 * If there is no more modules in the list, it return null
		 */
		function getSyncStatusPromise(){
			// Check if we have any more modules to work with
			if(modules == null || idx >= modules.length){
				return null;
			}

			// Get the next module and increment the index
			var module = modules[idx++];

			// Get the sync details for the current item in the list
			return self.getSyncStatusModuleOffline(module.id)
				.then((moduleSyncStatus) => {

					// Add the module to the modules map
					syncStatus.modules[module.id] = moduleSyncStatus;

					// Update the overall sync status to include the totals of the module
					syncStatus.inSync &= moduleSyncStatus.inSync;
					syncStatus.contentDownloadSize += moduleSyncStatus.contentDownloadSize;
					syncStatus.contentUploadSize += moduleSyncStatus.contentUploadSize;
					syncStatus.total += moduleSyncStatus.total;
					return syncStatus;
				});
		}

		/**
		 * Returns a promise to loop through all the modules to get their sync status
		 */
		function getLoopModulesPromise(linkedModules){
			modules = linkedModules;
			return SynthQLoop(getSyncStatusPromise).then(() => {
				return syncStatus;
			});
		}


		return ModuleService.getLinkedModules()
			.then(getLoopModulesPromise);

	};

	/**
	 * Get the offline sync status for a specific module without going online
	 * Resolves with an object:
	 *
	 * {
	 *		'inSync' : true,
			'contentDownloadSize': 0,
			'contentUploadSize': 0,
			'total': 0,
			'moduleId' : 'biology',
			'tools' : {
				'resources' : {
					'toolId' : 'resources',
					'moduleId' : 'biology',
					'contentUploadSize' : 1024,
					'contentDownloadSize' : 1024,
					'isDownload' : true,
					'label': 'Announcement'
				}
			}
		}
	 */
	SyncAPIServiceImpl.prototype.getSyncStatusModuleOffline = function(moduleId){
		var deferred = $q.defer();


		var errorHandler = _SF(deferred);
		var self = this;
		var moduleData = {};
		// The response object that will be sent to the caller of this function
		var syncStatus = {
			'inSync' : true,
			'download' : 0,
			'upload' : 0,
			'total' : 0,
			'moduleId' : moduleId,
			'tools' : {}
		};


		var funcUpdateTool = function(toolId){
			return self.getSyncStatusToolOffline(moduleId, toolId).then((toolSyncStatus) => {
				// Add the tool's sync status to the module's map of tools
				syncStatus.tools[toolId] = toolSyncStatus;

				// Update the module sync status to include the totals of the tools
				syncStatus.inSync &= toolSyncStatus.inSync;
				syncStatus.download += toolSyncStatus.download;
				syncStatus.upload += toolSyncStatus.upload;
				syncStatus.total += toolSyncStatus.total;

			});
		};

		ModuleService.getModuleData(moduleId).then((data) => {
			moduleData = data;
			// If we don't have tool we must be out of sync
			if(moduleData == null || moduleData.tools == null){
				syncStatus.inSync = false;
				deferred.resolve(syncStatus);
			}
			else{
				var idx = 0;
				var toolsArray = $filter('object2Array')(moduleData.toolsLocal);
				SynthQLoop(() => {
					var promise;
					// We have no more promises to update
					if (idx >= toolsArray.length){
						promise = null;
					}
					else{
						promise = funcUpdateTool(toolsArray[idx++].key);
					}
					return promise;
				}).then(() => {
					deferred.resolve(syncStatus);
				});
			}
		}, errorHandler);
		return deferred.promise;
	};

	/**
	 * Get the module upload size and save it to module.json
	 */
	SyncAPIServiceImpl.prototype.getToolUploadSize = function(moduleId, toolId){

		// Get promise to merge tool upload size to module.json
		function getMergeModuleDataPromise(size){
			// We also need to update our local file about the possible change of upload content
			var mergeData = { 'toolsLocal' : {} };
			mergeData.toolsLocal[toolId] = {
				'localChange' : (size !== 0),
				'localChangeSize' : size
			};
			return ModuleService
				.mergeToModuleData(moduleId, mergeData)
				.then(() => {
					return size;
				});
		}

		return DataService
			.getToolUploadDataSize(moduleId, toolId)
			.then(getMergeModuleDataPromise);
	};

	/**
	 * Update the sync status
	 */
	SyncAPIServiceImpl.prototype.getSyncStatus = function(moduleId){

		// The response object that will be sent to the caller of this function
		var syncStatus = {
			'inSync' : true,
			'tools' : {}
		};

		if(moduleId == null){
			return $q.when(syncStatus);
		}
		var moduleData = null, registration, self = this;

		function getRegistrationData(){
			return RegistrationService.getRegistration()
				.then((registrationData) => {
					registration = registrationData;
				});
		}

		// Returns a promise to get the module data
		function getModuleDataPromise(){
			return ModuleService
				.getModuleData(moduleId)
				.then((mData) => {
					moduleData = mData;
				});
		}

		// Returns a promise to get the sync status from the remote server
		function getRequestSyncStatusPromise(){
			var deferred = $q.defer();
			// Data that will be sent with the sync status request
			var reqData = {
				'tools' : {}
			};
			// Map mobile app tools to remote server tool names and add current versions
			for(var key in moduleData.toolsLocal){
				var mappedKey = mapTool(key);
				reqData.tools[mappedKey] = {
					'clientCodeVersion' : moduleData.toolsLocal[key].clientCodeVersion,
					'clientContentVersion' : moduleData.toolsLocal[key].clientContentVersion
				};
			}

			// Request changes from remote server
			var restURL = SynthConfig.baseURL + '/service-synch/synchStatus/' + registration.username + '/' + moduleId;
			LOG.debug('Getting sync status calling REST URL : ' + restURL);
			$http({
				method : 'POST',
				url : restURL,
				data : reqData})
				.then((response) => {
					// Check if there is an error
					if (CheckError(deferred, response.data)){
						return;
					}

					deferred.resolve(response.data.tools);
				}, () => {
					deferred.reject(SynthError(1000));
				});
			return deferred.promise;
		}

		// Returns a promise to write the response data to the module.json file
		function getWriteDownloadResponsePromise(responseTools){
			var fileData = { 'tools' : {}};
			// Map service tools to local tool names
			for(var remoteKey in responseTools){
				var localKey = mapTool(remoteKey);

				// Only if the tool is in our list of active tool
				if(moduleData.toolDescriptions[localKey] != null){

					// Data to write to file
					fileData.tools[localKey] = {
						'clientContentVersion' : responseTools[remoteKey].clientContentVersion,
						'currentContentVersion' : (responseTools[remoteKey].currentContentVersion === 'No Content' ? '0' : responseTools[remoteKey].currentContentVersion),
						'contentSynchSize' : responseTools[remoteKey].contentSynchSize
					};

					// Data to send back caller of this function
					syncStatus.tools[localKey] = {
						'label' : moduleData.toolDescriptions[localKey].label,
						'contentDownloadSize' : responseTools[remoteKey].contentSynchSize,
						'contentUploadSize' : 0,
						'inSync' : (responseTools[remoteKey].contentSynchSize === 0) // Ignoring code sync for mobile
					};
					syncStatus.download = ((syncStatus.download ? syncStatus.download : 0) + responseTools[remoteKey].contentSynchSize);// Ignoring code sync for mobile
					// If any tool has downloads, we are overall out of sync
					if (!syncStatus.tools[localKey].inSync){
						syncStatus.inSync = false;
					}
				}
			}
			return ModuleService.mergeToModuleData(moduleId, fileData);
		}

		/**
		 * Gets a promise to check the upload size for a tool
		 */
		var uIdx = 0;
		var toolsArray = null;
		function getUploadSizePromise(){

			// Create the array if we don't have it
			if(toolsArray == null){
				toolsArray = $filter('object2Array')(syncStatus.tools);
			}

			// If there are no more tools return null
			if(uIdx == toolsArray.length) {
				return null;
			}

			// Get the next tool id
			var toolId = toolsArray[uIdx++].key;

			syncStatus.tools[toolId] = syncStatus.tools[toolId] || {
				'codeDownloadSize' : 0,
				'contentDownloadSize' : 0,
				'contentUploadSize' : 0,
				'inSync' : true
			};
			syncStatus.tools[toolId].label = moduleData.toolDescriptions[toolId].label;

			return self
				.getToolUploadSize(moduleId, toolId)
				.then((size) => {
					syncStatus.tools[toolId].contentUploadSize = size;
					syncStatus.tools[toolId].inSync = (syncStatus.tools[toolId].inSync && (size === 0));
					syncStatus.upload = ((syncStatus.upload ? syncStatus.upload : 0) + size);
					syncStatus.inSync = (syncStatus.inSync && syncStatus.tools[toolId].inSync);
				});
		}


		return getRegistrationData()
			// Get the module data
			.then(getModuleDataPromise)
			// Get sync status from remote server
			.then(getRequestSyncStatusPromise)
			// Write the response to the module file
			.then(getWriteDownloadResponsePromise)
			// Get the upload size
			.then(() => {
				return SynthQLoop(getUploadSizePromise);
			})
			.then(() => {
				syncStatus.total = ((syncStatus.download ? syncStatus.download : 0) + (syncStatus.upload ? syncStatus.upload : 0));
				return syncStatus; // Finally we are done!
			});
	};

	/**
	 * Updates a specific tool
	 */
	SyncAPIServiceImpl.prototype.syncDownloadTool = function(moduleId, toolname){
		var moduleData = null,
			self = this,
			toolSyncResponse = {},
			toolDataObject = {}, // The data synced for this tool
			toolAttachments = [], // Attachments that has to be downloaded
			registration = null;

		$rootScope.$broadcast('syncStatusChanged', {'action' : 'downloading'});

		function getRegistrationData(){
			return RegistrationService.getRegistration()
				.then((registrationData) => {
					registration = registrationData;
				});
		}

		// Returns a promise to get the module data
		function getModuleDataPromise(){
			return ModuleService
				.getModuleData(moduleId)
				.then((mData) => {
					moduleData = mData;
				});
		}

		/*
		 * When we update client base, we need to make sure that we only
		 * include the tools that was configured to be enabled on the mobile application
		 */
		function filterBaseTools(toolList){
			var filteredData = {'toolDescriptions' : {} };
			var toolDescriptions = toolList == null ? {} : toolList.toolDescriptions;
			for(var serverToolId in toolDescriptions){
				var localToolId = mapTool(serverToolId);
				/*
				 * Only if the current module data contains a tool description, should the
				 * tool be included in the updated data.
				 */
				if(moduleData.toolDescriptions[localToolId] !== undefined){
					filteredData.toolDescriptions[localToolId] = toolDescriptions[serverToolId];
				}
			}
			return filteredData;
		}

		/*
		 * Returns a promise to get the tool's data
		 */
		function getToolDataPromise(){
			var deferredData = $q.defer();
			var toolVersion = moduleData.toolsLocal[toolname].clientContentVersion;
			var _toolname = mapTool(toolname);
			var restURL = `${SynthConfig.baseURL}/service-synch/contentUpdateString/${registration.username}/${moduleId}/${_toolname}/${toolVersion}`;

			$http({
				method : 'POST',
				url : restURL,
				data : {'authToken' : registration.authToken}})
				.success((data) => {
					// Check if there is an error
					if (CheckError(deferredData, data)){
						return;
					}

					toolSyncResponse = data;
					deferredData.resolve(data);
				})
				.error(() => {
					deferredData.reject(SynthError(1000));
				});
			return deferredData.promise;
		}


		/*
		 * When we get data from the server it is in base 64,
		 * this function will convert it to json format string
		 */
		function getConvertFromBase64Promise (base64Data){
			try{
				toolDataObject = base64.decode(base64Data.content);
				LOG.debug(`Got data for tool ${toolname}\n${toolDataObject}`);
				toolDataObject = JSON.parse(toolDataObject);
				$q.when(toolDataObject);
			}
			catch(e){
				$q.reject(SynthError(1000));
			}
		}

		/*
		 * Replace the inline images with links to the downloaded content
		 * This function will use the registered SynthEmbeddedImageHandler for the tool if
		 * there was on registered
		 */
		function getFixImagesPromise(){
			var imageHandler = SynthEmbeddedImageHandler.getHandler(toolname);
			if (imageHandler){
				return imageHandler(toolDataObject);
			}
			else{
				return $q.when([]);
			}
		}

		/*
		 * Replace all the embedded links with links that will open externally
		 */
		function getFixLinksPromise(){
			var linkHandler = SynthLinkHandler.getHandler(toolname);
			if (linkHandler){
				return linkHandler(toolDataObject).then((fixedContent)=>{
					toolDataObject = fixedContent;
				});
			}
			return $q.when([]);
		}

		/*
		 * Mine for attachments in the tool data
		 */
		function getMineAttachementsPromise(){
			var attachmentHandler = SynthAttachmentMiner.getHandler(toolname);
			if (attachmentHandler){
				return attachmentHandler(toolDataObject).then((attachments) => {
					toolAttachments = attachments;
				});
			}
			else{
				return $.when([]);
			}
		}
		/*
		 * Merge the tool data to the tool's data file
		 */
		function getMergeToolDataPromise(){
			if(toolname == 'base'){
				toolDataObject = filterBaseTools(toolDataObject);
				return ModuleService.mergeToModuleData(moduleId, toolDataObject);
			}
			else{
				return ModuleService.mergeToToolData(moduleId, toolname, toolDataObject);
			}
		}


		/*
		 * Download the attachments
		 */
		function getDownloadAttachmentsPromise(){
			return self.getAttachementsFromServer(toolAttachments);
		}
		/*
		 * Update the tool version
		 */
		function getUpdateToolVersionPromise(){
			var versionData = {
				'toolsLocal' : {},
				'tools' : {}
			};
			versionData.toolsLocal[toolname] = { 'clientContentVersion' : toolSyncResponse.version };
			versionData.tools[toolname] = {
				'currentContentVersion' : toolSyncResponse.version,
				'clientContentVersion' : toolSyncResponse.version,
				'contentSynchSize' : 0
			};
			return ModuleService.mergeToModuleData(moduleId, versionData);
		}

		/*
		 * Returns a promise to delete all the content (including actual files)
		 */
		function getCheckDeletedContentPromise(toolData){
			// Get the handler if there was one
			var deleteHandler = SynthDeleteHandler.getHandler(toolname);
			var handlerData;		// Data that the handler returned after processing
			if (deleteHandler){
				return deleteHandler(toolData)
					.then((hData) => {
						handlerData = hData;
						return DataService.deleteCDVFiles(handlerData.deleted);
					})
					// Now save the new data that the handler processed
					.then(() => {
						return DataService.writeToolData(moduleId, toolname, handlerData.data, false);
					});
			}
			else{
				return $.when([]);
			}
		}

		function fail(error){
			$rootScope.$broadcast('syncStatusChanged', {'action' : 'none'});
			return $q.reject(error);
		}


		// Lets start the sync process
		return getRegistrationData()
			.then(getModuleDataPromise)
			.then(getToolDataPromise)
			.then(getConvertFromBase64Promise)
			.then(getMineAttachementsPromise)
			.then(getDownloadAttachmentsPromise)
			.then(getFixImagesPromise)
			.then(getFixLinksPromise)
			.then(getMergeToolDataPromise)
			.then(getCheckDeletedContentPromise)
			.then(getUpdateToolVersionPromise)
			.then(() => {
				$rootScope.$broadcast('syncStatusChanged', {'action' : 'none'});
			}, fail);


	};

	/**
	 * Updates a specific tool
	 */
	SyncAPIServiceImpl.prototype.syncUploadTool = function(moduleId, toolname){
		var toolUploadRequest = {}, // Data to upload for the tool
			toolUploadResponse = {}, // Response for the upload
			registrationData = {};

		// Broadcast that we are busy uploading
		$rootScope.$broadcast('syncStatusChanged', {'action' : 'uploading'});
		/*
		 * Get the registration data for the user to get
		 * the device ID and username
		 */
		var funcGetRegistrationData = function(){
				return RegistrationService.getRegistration()
					.then((data) => {
						registrationData = data;
					});
			},
		/*
		 * Get the data for the tool that should get uploaded
		 */
			funcGetToolUploadData = function(){
				return DataService
					.getToolData(moduleId, toolname, true)
					.then((uploadData) => {
						toolUploadRequest = uploadData;
					});
			},
		/*
		 * Upload the data to the SynthEngine
		 */
			funcUploadToolData = function(){
				var uploadDeferred = $q.defer();
				var restURL = SynthConfig.baseURL + '/service-synch/content/' + registrationData.username + '/' + moduleId + '/' + mapTool(toolname);
				$http({
					'method' : 'PUT',
					'url' : restURL,
					'data' : {'authToken' : registrationData.authToken, 'content' : toolUploadRequest}
				})
					.success((responseData) => {
						// Check if there is an error
						if (CheckError(uploadDeferred, responseData)){
							return;
						}
						toolUploadResponse = responseData.responseContent;
						uploadDeferred.resolve(toolUploadResponse);
					})
					.error(() => {
						uploadDeferred.reject(SynthError(1000));
					});

				return uploadDeferred.promise;
			},
		/*
		 * Delete the file containing the upload data.
		 */
			funcDeleteToolUploadData = function(){
				return DataService.deleteToolUploadData(moduleId, toolname);
			},
		/*
		 * Merge the data we uploaded with our current data file for the tool.
		 * If there is a handler that needs work with the upload data and the
		 * upload response, we will use that before merging the data
		 */
			funcMergeToolData = function(){
				// Check if there is an upload handler and use it
				var uploadResponseHandler = SynthUploadResponseHandler.getHandler(toolname);
				if(uploadResponseHandler){
					toolUploadRequest = uploadResponseHandler(toolUploadRequest, toolUploadResponse);
				}
				return ModuleService.mergeToToolData(moduleId, toolname, toolUploadRequest, false);
			};

		function fail(error){
			$rootScope.$broadcast('syncStatusChanged', {'action' : 'none'});
			return $q.reject(error);
		}

		// Kick off the upload process
		return funcGetRegistrationData()
			.then(funcGetToolUploadData)
			.then(funcUploadToolData)
			.then(funcDeleteToolUploadData)
			.then(funcMergeToolData)
			.then(() => {
				$rootScope.$broadcast('syncStatusChanged', {'action' : 'none'});
			}, fail);
	};


	/**
	 * Update the Modules data file with the content from the remote server.
	 * This should only be called once per module, and only when the user
	 * registers for a module.
	 *
	 * This function will also check that the tools returned are supported by
	 * this client, therefor it might only use a subset of the returned data.
	 * The allowed tools are determined by the base.json file which is used for
	 * the base data file for each module (looking at the toolsLocal ids)
	 *
	 */
	SyncAPIServiceImpl.prototype.updateModuleData = function(moduleId){
		var deferred = $q.defer();

		var restURL = SynthConfig.baseURL + '/service-creator/tools/' + moduleId;
		LOG.debug('Getting module data using REST URL : ' + restURL);
		$http({
			method : 'GET',
			url : restURL})
			.success((data) => {
				if(LOG.isDEBUG()){
					LOG.debug('Got response for module data : ' + JSON.stringify(data, '\t', 4));
				}

				// Check if there is an error
				if (CheckError(deferred, data)) {
					return;
				}

				ModuleService.getModuleData(moduleId).then(
					function(moduleData){
						if(LOG.isDEBUG()){
							LOG.debug('Got current module data : ' + JSON.stringify(moduleData, '\t', 4));
						}
						var mergeData = { 'toolDescriptions' : {}, 'tools' : {}};

						// Loop through the data in the response
						for(var idx in data){
							var toolInfo = data[idx];
							var toolKeyLocal = mapTool(toolInfo.name);


							// Only use the tool if it is a tool we support
							if(moduleData.toolDescriptions[toolKeyLocal] !== undefined){
								mergeData.toolDescriptions[toolKeyLocal] = {};
								mergeData.toolDescriptions[toolKeyLocal].label = toolInfo.title;
								//mergeData.toolDescriptions[toolKeyLocal].description = data.toolDescriptions[toolKey].description;
								mergeData.toolDescriptions[toolKeyLocal].menu = toolInfo.onMenu;
							}
						}

						// Now merge the resulting data to our local file
						LOG.debug('We will now merge these : ' + JSON.stringify(mergeData, '\t', 4));

						ModuleService.mergeToModuleData(moduleId, mergeData).then(
							// Success
							() => {
								deferred.resolve();
							},
							_SF(deferred));
					}, _SF(deferred));


			})
			.error(() => {
				LOG.warn('Failed to get module data from remote server');
				deferred.reject(SynthError(1000));
			});
		return deferred.promise;
	};

	/**
	 * Download an array of files from the remote server for a specific tool
	 */
	SyncAPIServiceImpl.prototype.getAttachementsFromServer = function(attachments) {
		var self = this;
		let idx = 0;
		if (!attachments || attachments.length === 0){
			LOG.info('No need to download any attachments, an empty array was given');
			return $q.when({});
		}

		function downloadFile(){
			return self.getFileFromServer(attachments[idx].downloadKey, attachments[idx].downloadPath);
		}

		function getAttachment(){
			// if there is no more to get return null
			if(attachments.length === idx){
				return null;
			}
			var promise = downloadFile()
				.then(function(returnData){
					idx++;
					return returnData;
				});
			return promise;
		}

		return SynthQLoop(getAttachment);
	};


	/**
	 * Download a single file from the remote server.
	 *
	 * @param {type} downloadKey - Key of the file to download from the remote server
	 * @param {type} localPath - Full path to where the file should be saved locally on the device
	 */
	SyncAPIServiceImpl.prototype.getFileFromServer = function (downloadKey, localPath) {
		var deferred = $q.defer();

		// First make sure that the local path exists
		var fileTransfer = new FileTransfer();
		var uri = encodeURI(SynthConfig.baseURL + '/service-creator/download/file/' + downloadKey);
		LOG.debug('Downloading file with URL ' + uri);

		// Send back progress
		fileTransfer.onprogress = function(progressEvent) {
			deferred.notify(progressEvent);
		};

		fileTransfer.download(
			uri,
			localPath,
			function() {
				LOG.debug('Download is complete');
				deferred.resolve();
			},
			function(error) {
				LOG.warn('Failed to download file!');
				LOG.warn('download error source ' + error.source);
				LOG.warn('download error target ' + error.target);
				LOG.warn('download error code ' + error.code);
				deferred.reject(SynthError(1004));
			},
			false,
			{
				// No options
			}
		);

		return deferred.promise;
	};

	return new SyncAPIServiceImpl();

};
SyncAPIService.$inject = ['$q', '$http', '$filter', '$rootScope', 'base64', 'DataService',
	'LoggerService', 'SynthError', 'SynthFail', 'SynthCheckResponseError',
	'SynthConfig', 'SynthQLoop', 'ModuleService', 'RegistrationService', 'SynthAttachmentMiner',
	'SynthEmbeddedImageHandler', 'SynthDeleteHandler', 'SynthLinkHandler', 'SynthUploadResponseHandler'];

export default SyncAPIService;
