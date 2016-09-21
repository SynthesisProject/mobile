'use strict';
var SyncConfigureCtrl = ($scope, $rootScope, $location, SyncService, SyncSelection, LoggerService, SynthAuthenticateUser) => {
	var LOG = LoggerService('SyncConfigureCtrl');
	$rootScope.activePage = 'sync';
	$rootScope.breadcrumbs = [{'name' : 'Sync', 'url' : '#sync'}, {'name' : 'Configure'}];

	// Callback function for selecting tools to download
	$scope.updateTotals = function(){
		$scope.syncUpload = SyncSelection.getUploadSize();
		$scope.syncDownload = SyncSelection.getDownloadSize();
		$scope.syncTotal = SyncSelection.getTotal();
	};

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

	$scope.cancelSync = function(){
		$location.path('/home');
	};

	$scope.tools = SyncSelection.getSyncableToolsArray();
	$scope.updateTotals();
};

SyncConfigureCtrl.$inject = ['$scope', '$rootScope', '$location', 'SyncService', 'SyncSelection', 'LoggerService', 'SynthAuthenticateUser'];
export default SyncConfigureCtrl;
