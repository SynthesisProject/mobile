'use strict';

/**
* Helper to authenticate a user
* The success callback of the promise will receive the following object
*
* {
*	'code' 	 : 'success code ',
*	'username' : 'the username',
*	'password' : 'the password'
* }
*
* The success code can be compared with the following variables:
* SynthAuthenticateUser.SUCCESS	- 0
* SynthAuthenticateUser.FAILED	 - 1
* SynthAuthenticateUser.CANCELLED  - 2
*/
var SynthAuthenticateUser = ($q, RegistrationService, $injector, $rootScope) => {
	var SynthesisRESTClient;
	return {
		'FAILED' : '1',
		'SUCCESS' : '0',
		'CANCELLED' : '2',
		'login' : function(titleText = 'Please enter password', submitText = 'Authenticate'){
			var deferred = $q.defer();

			// If we don't have an instance yet, lets inject one now
			if(SynthesisRESTClient == null){
				SynthesisRESTClient = $injector.get('SynthesisRESTClient'); // Used injector to avoid runtime dependency circles
			}

			RegistrationService.getRegistration().then((registrationData) => {
				// If we have the password, just check if it is still valid
				if (registrationData.authToken != null){
					SynthesisRESTClient
					.authenticateUser(registrationData.username, registrationData.authToken, true)
					.then(
						(result) => {
							if(result.authenticated){
								deferred.resolve({'code' : 0,
								'username' : result.username,
								'authToken' : result.authToken}); // SUCCESS
							}
							else{
								showAuthenticationDialog(registrationData.username);
							}

						},
						(error) => {
							deferred.reject(error);
						});
				}
				// If we don't have an auth token, we need to start off
				// by showing the authentication dialog
				else {
					showAuthenticationDialog(registrationData.username);
				}
			}, (error) => {
				deferred.reject(error);
			});


			function cleanup(){
				$rootScope.authenticationModel = null;
				$rootScope.authenticationOk = null;
				$rootScope.authenticationCancelled = null;
			}

			// Show the authentication dialog and register all the callbacks
			function showAuthenticationDialog(username){
				// Reset model used for login
				$rootScope.authenticationModel = {
					// Username of the current user
					'username' : username,

					// Password of the current user
					'password' : null,

					// Flag if the authentication failed
					'authFailed' : false,

					// Message to show if authentication failed
					'message' : null,

					// Instruction to show if the authentication failed
					'instruction' : null,

					// Text to display on the submit button
					'submitText' : submitText,

					// Title to display for the login
					'titleText' : titleText
				};


				// Callback when the user presses OK to authenticate
				$rootScope.authenticationOk = function(){
					SynthesisRESTClient
					.authenticateUser($rootScope.authenticationModel.username, $rootScope.authenticationModel.password)
					.then(
						function success(result){
							if(result.authenticated){
								$('#synthAuthenticationModal').modal('hide');
								deferred.resolve({'code' : 0,
								'username' : $rootScope.authenticationModel.username,
								'password' : $rootScope.authenticationModel.password}); // SUCCESS
								cleanup();
							}
							else{
								// Get the message and instruction from the result and display
								$rootScope.authenticationModel.message = result.message;
								$rootScope.authenticationModel.instruction = result.instruction;
								$rootScope.authenticationModel.password = null;
								$rootScope.authenticationModel.authFailed = true;
							}

						},
						function errorHandler (error){
							$('#synthAuthenticationModal').modal('hide');
							cleanup();
							deferred.reject(error);
						});
				};

				// Callback when the user cancelled Authentication
				$rootScope.authenticationCancelled = function(){
					$('#synthAuthenticationModal').modal('hide');
					cleanup();
					deferred.resolve({'code' : 2}); // Cancelled
				};
				// Show the error dialog
				$('#synthAuthenticationModal').modal('show');
			}

			return deferred.promise;
		}
	};
};
SynthAuthenticateUser.$inject = ['$q', 'RegistrationService', '$injector', '$rootScope'];
export default SynthAuthenticateUser;
