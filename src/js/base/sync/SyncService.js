'use strict';

var SyncService = ($q, $timeout, $filter, $rootScope, SyncAPIService, LoggerService,
	UserSession, SyncSelection, ModuleService, safo, UserSettings) => {


	var LOG = LoggerService('SyncService');

	// The current sync promsie
	var syncBackgroundPromise = null;


	class SyncServiceImpl{

		/**
		* Gets a summary of the sync status for all modules the user
		* is linked to.
		*/
		getSyncDetails(){

			var syncDetails = {
				inSync : true,
				download : 0,
				upload : 0,
				total : 0,
				tools : []
			};

			/**
			* Returns a promise to loop through all the modules to get their sync status
			*/
			function getLoopModulesPromise(linkedModules){
				let promise = $q.when();
				angular.forEach(linkedModules, function(linkedModule){
					promise = promise.then(function(){
						// Get the sync details for the current item in the list
						return SyncAPIService.getSyncStatus(linkedModule.id)
							.then((syncStatus) => {
								syncDetails.inSync = syncDetails.inSync && syncStatus.inSync;
								syncDetails.download += syncStatus.download;
								syncDetails.upload += syncStatus.upload;
								syncDetails.total += syncStatus.total;

								var tools = $filter('object2Array')(syncStatus.tools);
								safo(tools, 'moduleId', linkedModule.id, 'moduleName', linkedModule.name);
								syncDetails.tools = syncDetails.tools.concat(tools);
							});
					});
				});
				return promise.then(function(){
					$rootScope.$broadcast('syncStatusChanged', {'state' : syncDetails.inSync ? 'inSync' : 'outSync'});
					return syncDetails;
				});
			}

			/**
			* Get the list of all the modules currently linked to this app
			* Then loop through each of them to build up a big sync status
			*/
			return ModuleService.getLinkedModules()
				.then(getLoopModulesPromise);
		}

		/***
		* Sync a tool
		* @param toolname - name of the tool to sync
		*/
		syncDownloadTool(moduleId, toolname){
			return SyncAPIService.syncDownloadTool(moduleId, toolname);
		}


		/***
		* Performs a synchronise of the selected tools
		*/
		syncSelected(syncSelection){

			// Initialise scope variables for this page
			var toolUploads = syncSelection.getUploadArray();
			var toolDownloads = syncSelection.getDownloadArray();
			var didUpdateBase = false;// Flag if we updated base. If base was updated we need to reload the tools
			var self = this;
			/*
			* Function that will return promise for new download if there is any
			* or returns null if there are no more promises for downloads
			*/
			function getDownloadPromise(){
				let promise = $q.when();
				angular.forEach(toolDownloads, function(tool){
					promise = promise.then(function(){
						return self.syncDownloadTool(tool.moduleId, tool.key)
						.then(() => {
							LOG.debug('Completed download for tool : ' + tool.key);
							tool.downloadProgress = 100;

							// Set the flag if we downloaded for base
							if(tool.key == 'base'){
								didUpdateBase = true;
							}
						});
					});
				});
				return promise;
			}

			/*
			* Function that will return a promise for the new upload if there is any
			* or returns null if there are no more promises for uploads
			*/
			function getUploadPromise(){
				let promise = $q.when();
				angular.forEach(toolUploads, function(tool){
					promise = promise.then(function(){
						return self.syncUploadTool(tool.key)
						.then(() => {
							LOG.debug('Completed upload for tool : ' + tool.key);
							tool.downloadProgress = 100;
						});
					});
				});
				return promise;
			}

			// Get the promise to check the offline status
			function emitSyncStatusChange(){
				$rootScope.$broadcast('syncStatusChanged');
				return {
					'didUpdateBase' : didUpdateBase
				};
			}

			// Start loop with downloads
			return getDownloadPromise()
				.then(getUploadPromise)
				.then(emitSyncStatusChange);

		}


		/***
		* Sync a tool
		* @param toolname - name of the tool to sync
		*/
		syncUploadTool(moduleId, toolname){
			return SyncAPIService.syncUploadTool(moduleId, toolname);
		}

		startBackgroundSync(){
			const self = this;
			// Make sure we are not already running
			if(syncBackgroundPromise == null){

				UserSettings.getSettings().then((settings) => {
					if(settings.autoSyncDownload || settings.autoSyncUpload){
						LOG.debug('Starting background sync timer... ' + settings.autoSyncInterval);
						// Start and save the promise
						syncBackgroundPromise = $timeout(() => {
							/*
							* Because this happens somewhere later in time, we need to check if we actually still
							* want to continue with the sync.
							* This shouldn't be a problem because the UI should stop the timer promise when the user
							* decides to cancel the auto sync, but we do it anyway ;)
							*/
							if(settings.autoSyncDownload || settings.autoSyncUpload){
								self._handleTimedSync();
							}
						}, settings.autoSyncInterval || 180000); // Avoid runaway if for some reason this gets null
					}
					else{
						LOG.debug('Not going to start sync, it is not enabled');
					}
				});
			}
			else{
				LOG.debug('Cannot start background sync again, already running...');
			}
		}

		_handleTimedSync(){
			LOG.debug('Need to check for sync now');
			const self = this;
			$timeout.cancel(syncBackgroundPromise);

			UserSettings.getSettings().then((settings) => {
				self.getSyncDetails().then((syncStatus) => {

					var syncSelection = SyncSelection.newInstance();
					syncSelection.tools = syncStatus.tools;

					if(settings.autoSyncDownload){
						syncSelection.selectAllDownloads();
					}

					if(settings.autoSyncUpload){
						syncSelection.selectAllUploads();
					}

					self.syncSelected(syncSelection).then(() => {
						syncBackgroundPromise = null;
						self.startBackgroundSync(); // Restart the timer
					});

				});
			});
		}


		stopBackgroundSync(){
			LOG.debug('Stopping background sync timer...');
			if(syncBackgroundPromise != null){
				$timeout.cancel(syncBackgroundPromise);
				syncBackgroundPromise = null;
			}
		}

		/**
		* Function to notify this service that there are changes that need
		* attention
		*/
		notifyChanges(){
			$rootScope.$broadcast('syncStatusChanged', {'state' : 'outSync'});
			this._handleTimedSync(); // Handle it now if we can
		}

	}


	return new SyncServiceImpl();

};
SyncService.$inject = ['$q', '$timeout', '$filter', '$rootScope', 'SyncAPIService', 'LoggerService',
'UserSession', 'SyncSelection', 'ModuleService', 'safo', 'UserSettings'];
export default SyncService;
