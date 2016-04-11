/*
 * base/js/register/RegisterCtrl.js
 */
var RegisterCtrl = ($scope, $rootScope, $location, $q, SynthesisRESTClient, DataService, SynthErrorHandler, SynthError, PushService) => {
	$rootScope.activePage = 'register';
	$rootScope.breadcrumbs = [{'name' : 'Register'}];
	$scope.authFailed = false;
	$scope.login = {username : '', password : ''};
	$scope.busyLogin = false;
	$scope.submitButtonTxt = 'Sign in';

	var funcAuthenticateUser = function(){
			funcSigningIn(true);
			var username = $scope.login.username;
			var password = $scope.login.password;
			return SynthesisRESTClient
				.authenticateUser(username, password)
				.then((result) => {
					funcSigningIn(false);
					if(!result.authenticated){
						// $scope.login.password = null; // Clear entered password
						return $q.reject(SynthError(result));
					}
					return undefined;
				});
		},
		funcCompleted = function(){
			// We don't need to wait for this to complete, it must just happen
			PushService.registerDevice();
			$location.path('/register-selectModules');
		},
		funcFailed = function(reason){
			funcSigningIn(false);
			return SynthErrorHandler(reason);
		},
		funcSigningIn = function(isBusy){
			$scope.submitButtonTxt = isBusy ? 'Signing in' : 'Sign in';
			$scope.busyLogin = isBusy;
		};

	// Submit handler
	$scope.submit = function(){
		funcAuthenticateUser().then(funcCompleted, funcFailed);
	};
};
RegisterCtrl.$inject = ['$scope', '$rootScope', '$location', '$q', 'SynthesisRESTClient', 'DataService', 'SynthErrorHandler', 'SynthError', 'PushService'];
export default RegisterCtrl;
