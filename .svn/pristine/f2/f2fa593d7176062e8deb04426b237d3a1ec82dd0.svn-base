'use strict';
var SettingsPushCtrl = ($scope, $rootScope, DataService, SynthErrorHandler, UserSession, PushService, SynthAuthenticateUser) => {


	const STATES = {
		STATE_LOADING : 1,
		STATE_LOADED : 2,
		STATE_SAVING : 3,
		STATE_SAVED : 4,
		STATE_ERROR : 99
	};

	// Add properties to scope
	angular.extend($scope, {
		state : 0,
		error : false,
		preferences : null,
		loadingModules : true,
		savingPreferences : false,
		toggledTool : toggledTool
	},
	STATES);

	function getPreferences(){
		return PushService.getPushToolPreferences().then((prefs) => {
			$scope.preferences = prefs;
			$scope.state = STATES.STATE_LOADED;
		}, (reason) => {
			SynthErrorHandler(reason).then(() => {}, () => {
				$scope.errorMessage = 'Failed to retrieve preferences';
				$scope.error = true;
			});
		});
	}

	getPreferences();

	function toggledTool(moduleId, toolId, value, $event){
		if($event){
			$event.stopImmediatePropagation();
			$event.stopPropagation();
		}
		$scope.preferences[moduleId][toolId] = value;
	}


	function updateSettings(){
		$scope.state = STATES.STATE_SAVING;
		return PushService.updatePushPreferences($scope.preferences)
			.then(function success(prefs){
				$scope.state = STATES.STATE_SAVED;
				$scope.preferences = prefs;
			}, function failed(reason){

				if(reason.id === 2002){
					SynthAuthenticateUser
						.login('Please enter password', 'Save Settings')
						.then(function(result){
							if(SynthAuthenticateUser.SUCCESS == result.code){
								updateSettings();
							}
							else{
								$scope.errorMessage = 'You need to authenticate';
								$scope.state = STATES.ERROR;
							}
						});
				}
				else{
					SynthErrorHandler(reason).then(() => {}, () => {
						$scope.errorMessage = 'Failed to save preferences';
						$scope.state = STATES.ERROR;
					});
				}
			});
	}

	// Update the current push settings on the Synthesis server and
	// update local config. If the user is offline or the server has a problem
	// we will not persist the current settings
	$scope.save = function(){
		updateSettings().then(getPreferences);
	};
};
SettingsPushCtrl.$inject = ['$scope', '$rootScope', 'DataService', 'SynthErrorHandler', 'UserSession', 'PushService', 'SynthAuthenticateUser'];
export default SettingsPushCtrl;
