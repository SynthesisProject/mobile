'use strict';

var SettingsCtrl = ($scope, $rootScope, $location, LoggerService, DataService, SynthErrorHandler, UserSession, SyncService, UserSettings, UserService, SynthUploadResponseHandler) => {
	$rootScope.activePage = 'settings';
	$rootScope.breadcrumbs = [{'name' : 'Settings'}];

	var settings;

	// The application can only upload if there are handlers to uploads
	$scope.canUpload = SynthUploadResponseHandler.hasHandlers();

	UserSettings.getSettings().then((userSettings) => {
		settings = userSettings;
		/*
		* Auto sync
		*/
		$scope.animateSwitch = false;
		$scope.settings = settings;
		$scope.animateSwitch = true;

	});

	UserService.isRegistrationComplete().then((iscomplete) => {
		$scope.isRegistered = iscomplete;
	});

	/*
	* Perform the delete of the account
	*/
	function performDeleteAccount(){
		DataService.deleteAllApplicationData()
			.then(() => {
				SyncService.stopBackgroundSync();
				$rootScope.$broadcast('syncStatusChanged', {'action' : 'none'});
				$rootScope.tools = null;
				UserSession.clearSession();
				$location.path('/boot');
			}, SynthErrorHandler);

		// TODO delete all push preferences on server, the user might be offline....
	}

	/*
	* Prompt the user to confirm deleting the account
	*/
	$scope.confirmDeleteAccount = () => {
		navigator.notification.confirm(
			'Are you sure you want to delete ALL account details and downloaded content?',
			function(index){
				if (index === 2){
					performDeleteAccount();
				}
			},
			'Delete account',
			['No', 'Yes']);
	};

	// Watch auto download toggle
	$scope.$watch('settings.autoSyncDownload', (newValue) => {

		UserSettings.saveSettings({'autoSyncDownload' : newValue}).then((newSettings) => {

			$scope.settings = newSettings;
			if(newSettings.autoSyncDownload || newSettings.autoSyncUpload){
				SyncService.startBackgroundSync();
			}
			else{
				SyncService.stopBackgroundSync();
			}
		});
	});

	// Watch auto upload toggle
	$scope.$watch('settings.autoSyncUpload', (newValue) => {

		UserSettings.saveSettings({'autoSyncUpload' : newValue}).then(function(newSettings){

			$scope.settings = newSettings;
			if(newSettings.autoSyncDownload || newSettings.autoSyncUpload){
				SyncService.startBackgroundSync();
			}
			else{
				SyncService.stopBackgroundSync();
			}
		});
	});

};
SettingsCtrl.$inject = ['$scope', '$rootScope', '$location', 'LoggerService', 'DataService', 'SynthErrorHandler',
 'UserSession', 'SyncService', 'UserSettings', 'UserService', 'SynthUploadResponseHandler'];
export default SettingsCtrl;
