'use strict';
class AppController {

	constructor($scope, $routeParams, UserSession, UserService, SynthConfig, SyncService, SynthError){
		// This is not a real error, this only initialises the SynthError class
		SynthError(1000);

		/**
		* Callback function to open the vendor website
		*/
		$scope.linkVendor = function(){
			window.open(SynthConfig.vendorURL, '_system');
		};

		// Name of the vendor for the application
		$scope.vendorName = SynthConfig.vendorName;

		// Name of the application
		$scope.applicationName = SynthConfig.applicationName;

		// User session object
		$scope.userSession = UserSession;

		// The initial sync background task is started by the boot process
		function onPaused(){
			SyncService.stopBackgroundSync();
		}

		function onResume(){
			SyncService.startBackgroundSync();
		}

		document.addEventListener('pause', onPaused, false);
		document.addEventListener('resume', onResume, false);

		// Set default options for some scrollers
		$scope.myScrollOptions = $scope.myScrollOptions || {};
		$scope.myScrollOptions.menuScroll = {
			scrollbars : true
		};
		$scope.myScrollOptions.mainScroll = {
			scrollbars : true,
			scrollX : true
		};

		var showingExitPrompt = false;

		/**
		* Function to go back from the button on the screen
		*/
		$scope.goBack = function(){
			if ($scope.activePage === 'home' || $scope.activePage === 'register' || $scope.activePage === 'boot'){
				// iOS cannot exit an application
				if(!showingExitPrompt && device.platform !== 'iOS'){
					navigator.notification.confirm(
							'Are you sure you want to exit the application?',
							function(index){
								showingExitPrompt = false;
								if (index === 2){
									navigator.app.exitApp();
								}
							},
							'Exit Application',
							['No', 'Yes']);
				}
			}
			else{
				navigator.app.backHistory();
			}
		};

		/**
		* Redirect the native back button to the same handler when the user
		* clicks the back button on the application
		*/
		document.addEventListener('backbutton', function(){
			$scope.goBack();
		}, false);
	}
}
AppController.$inject = ['$scope', '$routeParams', 'UserSession', 'UserService', 'SynthConfig', 'SyncService', 'SynthError'];
export default AppController;
