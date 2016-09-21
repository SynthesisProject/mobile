'use strict';

/**
* Controller to allow the user to select modules that should be used by this application
*/
var RegisterSelectModuleCtrl = ($q, $scope, $rootScope, $location, ModuleService, DataService, UserSession, LoggerService, SyncAPIService, SynthErrorHandler, SynthAuthenticateUser, RegistrationService) => {
	var LOG = LoggerService('RegisterSelectModuleCtrl');

	$rootScope.activePage = 'register-selectModule';
	$rootScope.breadcrumbs = [{'name' : 'Select Modules'}];

	// Add properties to scope
	angular.extend($scope, {
		error : false,
		errorMessage : null,
		canContinue : false,
		loadingModules : true,
		modules : null,
		// Bind to function
		hasSelectedModules : false,
		hasNewModules : false
	});
	var firstTime = true;


	var getSelectedModules = function(){
			var modules = $scope.modules;

			// If there is no modules, we have nothing
			if(modules == null){
				return null;
			}
			var selectedModules = [];

			_.forEach(modules, (module) => {
				if (module.selected && !module.registered){
					var newModule = angular.copy(module);
					delete newModule.selected;
					selectedModules.push(newModule);
				}
			});
			return selectedModules;
		},
		// Get the first module that the user selected
		getFirstSelectedModule = function(){
			var selectedModules = getSelectedModules();
			return selectedModules == null ? null : selectedModules[0];
		},
		checkSelectedModules = function(){
			$scope.hasSelectedModules = getFirstSelectedModule() != null;

			if(firstTime || $scope.hasSelectedModules){
				$scope.error = false;
				$scope.canContinue = true;
				firstTime = false;
			}
			else{
				warnSelectModule();
			}
		},

		// Warns the user that a module must be selected
		warnSelectModule = function(){
			angular.extend($scope, {
				error : true,
				errorMessage : 'You must select atleast one module',
				canContinue : false
			});
		};

	function getModules(){
		$scope.loadingModules = true;
		var currentModules, newModules;

		// Save the newly discover modules to our list of known modules
		function saveNewModules(){

			// If there is now new modules we don't have to save anything
			if(newModules.lenth === 0){
				return $q.when([]);
			}

			var mergeMap = { modules : {}};

			_.forEach(newModules, (newModule) => {
				mergeMap.modules[newModule.id] = newModule;
			});

			return RegistrationService.mergeRegistration(mergeMap);
		}

		function getCurrentModules(){
			return ModuleService.getCurrentModules().then((modules) => {
				currentModules = modules;
			});
		}

		function getNewModules(){
			return ModuleService.getNewModules().then((modules) => {
				$scope.hasNewModules = modules.length > 0;
				newModules = modules;
			});
		}

		function concatModules(){
			$scope.loadingModules = false;
			return $q.when(currentModules.concat(newModules));
		}

		getCurrentModules()
			.then(getNewModules)
			.then(saveNewModules)
			.then(concatModules)
			.then((modules) => {
				$scope.loadingModules = false;
				$scope.modules = modules;
				if($scope.modules.length == 0){
					angular.extend($scope, {
						error : true,
						errorMessage : 'You are not registered for any modules',
						canContinue : false,
						modules : null
					});
				}
				checkSelectedModules();
			}, (reason) => {
				$scope.loadingModules = false;

				if(reason.id === 2002){
					SynthAuthenticateUser
					.login('Please enter password', 'Sync')
					.then(function(result){
						if(SynthAuthenticateUser.FAILED == result.code){
							LOG.warn('Authentication failed');
						}
						else if(SynthAuthenticateUser.SUCCESS == result.code){
							getModules();
						}
						else{
							$scope.errorMessage = 'You need to authenticate';
							$scope.error = true;
						}
					});
				}
				else{
					SynthErrorHandler(reason).then(() => {}, () => {
						$scope.errorMessage = 'Failed to retrieve modules';
						$scope.error = true;
					});
				}
			});
	}


	// Toggle the selection of a module
	$scope.toggleModule = function(module){

		// Do nothing if the user is already registered for the module
		if(module.registered){
			return;
		}

		module.selected = !module.selected;
		checkSelectedModules();
	};


	// Function to handle submit of the form
	$scope.submit = function(){

		// Check that there was a selection
		if (!$scope.hasSelectedModules){
			$scope.errorMessage = 'You must select atleast one module';
			$scope.error = true;

		/*
		* If there was modules selected, we will go to the next page
		* where the device will register with the service that those
		* modules will be used on the device.
		*/
		}
		else{
			// Get the modules the user choose
			UserSession.registration = UserSession.registration || {};
			UserSession.registration.modules = getSelectedModules();

			// Go to the next page where the modules will get registered
			$location.path('/register-modulesRegistration');
		}
	};

	getModules();

};
RegisterSelectModuleCtrl.$inject = ['$q', '$scope', '$rootScope', '$location', 'ModuleService', 'DataService', 'UserSession', 'LoggerService', 'SyncAPIService', 'SynthErrorHandler', 'SynthAuthenticateUser', 'RegistrationService'];
export default RegisterSelectModuleCtrl;
