'use strict';
var SyncProgressCtrl = ($scope, $rootScope, $filter, $timeout, $q, SyncService, DataService, SyncAPIService, SynthQLoop, SyncSelection, LoggerService, HomeService, SynthErrorHandler, SynthAuthenticateUser) => {
	var LOG = LoggerService('SyncProgressCtrl');

	// Update active page and breadcrumbs
	$rootScope.activePage = 'sync';
	$rootScope.breadcrumbs = [{'name' : 'Sync', 'url' : '#sync'}, {'name' : 'Synchronising'}];

	// Initialise scope variables for this page
	$scope.syncError = false; // Flag if there was an error during the sync
	$scope.syncBusy = true;  // Flag if we are still busy syncing
	$scope.toolUploads = SyncSelection.getUploadArray();
	$scope.toolDownloads = SyncSelection.getDownloadArray();


	/*
	* Function that will return a promise to update the tools.
	* If the flag was set that base was updated, the tools will be reloaded
	*/
	function getUpdateToolsPromise(response){
		if(response.didUpdateBase === true){
			return HomeService
			.getHomeTools()
			.then((tools) => {
				$rootScope.tools = tools;
				return response;
			});
		}
		else{
			return $q.when(response);
		}
	}

	function startSync(){
		SyncService.syncSelected(SyncSelection)
		// Update the tools if we need to
		.then(getUpdateToolsPromise)
		.then(() => {// Overall success
			LOG.debug('Synching of all tools completed without error');
			$scope.syncBusy = false;
		},
		(reason) => {// Overall failure
			LOG.debug('Synching of all tools completed with errors!');
			$scope.syncBusy = false;
			$scope.syncError = true;

			/*
			* If the auth token is not valid, let user enter password
			* again
			*/
			if(reason.id === 2002){
				SynthAuthenticateUser
				.login('Please enter password', 'Sync')
				.then((result) => {
					if(SynthAuthenticateUser.FAILED == result.code){
						LOG.warn('Authentication failed');
					}
					else if(SynthAuthenticateUser.SUCCESS == result.code){
						startSync();
					}
				});
			}
			else{
				SynthErrorHandler(reason);
			}
		});
	}
	startSync();
};
SyncProgressCtrl.$inject = ['$scope', '$rootScope', '$filter', '$timeout', '$q', 'SyncService', 'DataService', 'SyncAPIService', 'SynthQLoop', 'SyncSelection', 'LoggerService', 'HomeService', 'SynthErrorHandler', 'SynthAuthenticateUser'];
export default SyncProgressCtrl;
