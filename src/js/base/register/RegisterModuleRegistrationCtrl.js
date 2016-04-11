'use strict';

/**
* Controller to register the modules with the sync engine
*/
var RegisterModuleRegistrationCtrl = ($scope, $rootScope, $location, UserSession, DataService, RegisterService, LoggerService, SynthErrorHandler, SynthAuthenticateUser, ModuleService) =>{
	var LOG = LoggerService('RegisterModuleRegistrationCtrl');

	$rootScope.activePage = 'register-moduleRegistration';
	$rootScope.breadcrumbs = [{'name' : 'Registering Modules'}];
	$scope.error = false;
	$scope.busy = true;

	/*
	* Check that the user still has a registration object on the user session.
	* This object might be deleted if the user presses back after completing a
	* registration
	*/
	if (UserSession.registration.modules == null){
		LOG.info('There are no modules for active user');
		$location.path('/register');
		return;
	}

	ModuleService.getLinkedModules().then((registeredModulesObj) => {
		var modules = [];

		_.forEach(UserSession.registration.modules, (module) => {
			if(!(registeredModulesObj[module.id] != null)){
				modules.push(module);
			}
		});

		// If there are no modules to register for, we are done
		if(modules.length == 0){
			$location.path('/home');
			return;
		}

		// Add the modules to the scope and start the registration
		$scope.modules = modules;
		startRegistrations();
	});

	var funcInitModules = function(){
			return RegisterService.initModules($scope.modules);
		},
		funcRegisterModules = function(){
			return RegisterService.registerModules($scope.modules);
		},
		funcGoToSync = function(){
			$scope.busy = false;
			$location.path('/sync');
		},
		funcHandleError = function(reason){

			if(reason.id === 2002){
				SynthAuthenticateUser
				.login('Please enter password', 'Sync')
				.then((result) => {
					if(SynthAuthenticateUser.FAILED == result.code){
						LOG.warn('Authentication failed');
					}
					else if(SynthAuthenticateUser.SUCCESS == result.code){
						startRegistrations();
					}
					else{
						$scope.errorMessage = 'You need to authenticate';
						$scope.error = true;
					}
				});
			}
			else{
				SynthErrorHandler(reason).then(() => {}, () =>{
					LOG.error('Error while trying to register for modules');
					$scope.error = true;
				});
			}
		};

	function startRegistrations(){
		funcInitModules()
		.then(funcRegisterModules)
		.then(funcGoToSync, funcHandleError);
	}
};
RegisterModuleRegistrationCtrl.$inject = ['$scope', '$rootScope', '$location', 'UserSession', 'DataService', 'RegisterService', 'LoggerService', 'SynthErrorHandler', 'SynthAuthenticateUser', 'ModuleService'];
export default RegisterModuleRegistrationCtrl;
