'use strict';
/*
* base/js/sync/SyncCtrl.js
*/
var SyncCtrl = ($scope, $rootScope, $location, SyncService, SyncSelection, LoggerService, SynthAuthenticateUser, SynthErrorHandler) => {
	var LOG = LoggerService('SyncCtrl');
	$rootScope.activePage = 'sync';
	$rootScope.breadcrumbs = [{'name' : 'Sync Summary'}];


	$scope.haveSyncStatus = false;
	// Get the scope summary and attach to model
	SyncService
		.getSyncDetails()
		.then((summary) => {
			$scope.syncSummary = summary;
			$scope.haveSyncStatus = true;
			SyncSelection.tools = summary.tools;
			SyncSelection.selectAll(); // Mark all downloads and uploads by default
		}, SynthErrorHandler);


	// Callback function to go to the sync
	$scope.doSync = function(){
		SynthAuthenticateUser
		.login('Please enter password', 'Sync')
		.then((result) => {
			if(SynthAuthenticateUser.FAILED == result.code){
				LOG.warn('Authentication failed');
			}
			else if(SynthAuthenticateUser.SUCCESS == result.code){
				$location.path('/sync-progress');
			}
		});
	};

	$scope.configureSync = function(){
		$location.path('/sync-configure');
	};
};
SyncCtrl.$inject = ['$scope', '$rootScope', '$location', 'SyncService', 'SyncSelection', 'LoggerService', 'SynthAuthenticateUser', 'SynthErrorHandler'];
export default SyncCtrl;
