'use strict';

class SynthesisRESTClient{

	constructor($q, $http, RegistrationService, SynthConfig, CheckError, SynthError, SynthAuthenticateUser){
		this.$q = $q;
		this.$http = $http;
		this.registrationService = RegistrationService;
		this.synthConfig = SynthConfig;
		this.checkError = CheckError;
		this.synthError = SynthError;
		this.synthAuthenticateUser = SynthAuthenticateUser;
	}

	/**
	 *
	 * @param path Path to which the service is pointing
	 * @param Http method to use
	 * @param Http method to use
	 */
	_doRequest(path, method, data, appendAuthentication = false, checkLoginFail = true){
		let submitData = data || {};
		var deferred = this.$q.defer();
		const self = this;
		// Add authentication details
		function addAuthentication(){
			return self.registrationService.getRegistration().then((registration) => {
				submitData.authToken = registration.authToken;
				submitData.username = registration.username;
			});
		}

		// Send the request to the server
		function performRequest(){
			return self.$http({
				'method' : method,
				'url' : `${self.synthConfig.baseURL}${path}`,
				'data' : submitData});
		}

		// Handle authentication problems on requests, by attempting to let the
		// use re-login
		function handleAuthenticationError(){
			this.authenticateUser
			.login()
			.then((result) => {
				if(self.synthAuthenticateUser.SUCCESS == result.code){
					tryRequest(); // Now lets try again
					return undefined;
				}
				else{
					deferred.reject(self.synthError(3000));
					return self.$q.reject(self.synthError(3000));
				}
			},
			// Something went wrong trying to authenticate
			(reason) => {
				deferred.reject(reason);
				return self.$q.reject(reason);
			});
		}

		function tryRequest(){
			let tryPromise;
			if(appendAuthentication){
				tryPromise = addAuthentication()
					.then(performRequest);
			}
			else{
				tryPromise = performRequest();
			}
			return tryPromise.then(
				// Success
				(successData) => {
					if(checkLoginFail && successData.data.errorCode != undefined
						&& (successData.data.errorCode === 2002 || successData.data.errorCode === 1005)){
						handleAuthenticationError();
					}
					else{
						deferred.resolve(successData);
					}
				},
				// Failure
				(reason) => {
					deferred.reject(reason);
					return self.$q.reject(reason);
				}

			);
		}

		tryRequest();
		return deferred.promise;
	}
	/**
	 * Gets the sites allowed for this user
	 * @returns Returns an array of sites the user has available
	 */
	getAllowedSites(){

		return this.registrationService.getRegistration().then((registration) => {
			return this._doRequest(`/service-auth/allowedSitesPost/${registration.username}`,
				'POST',
				{'authToken' : registration.authToken}
			).then((response) => {
				var data = response.data;
				// Check if there is an error
				if (this.checkError(null, data)) {
					return this.$q.reject(this.synthError(data));
				}
				return data.modules;
			}, () => {
				return this.$q.reject(this.synthError(1000));
			});
		});
	}

	/**
	 * Gets a push message from the server
	 */
	getPushMessage(id){
		return this._doRequest('/service-push/getPush',
			'POST',
			{pushId : id},
			true
		).then((response) => {
			var data = response.data;
			// Check if there is an error
			if (this.checkError(null, data)) {
				return this.$q.reject(this.synthError(data));
			}
			return data.push;
		}, () => {
			return this.$q.reject(this.synthError(1000));
		});
	}

	/**
	 * Authenticates a user to the remote server
	 */
	authenticateUser(username, password, isToken = false){
		var requestData;
		const self = this;
		if(isToken){
			requestData = {'authToken' : password};
		}
		else{
			requestData = {'password' : password};
		}

		function getAuthenticatePromise(){
			return self._doRequest(`/service-auth/login/${username}`,
				'POST',
				requestData,
				false, // Do not add auth details
				false // Do not handle invalid cridentials
			).then((response) => {
				var data = response.data;

				// Authentication failed
				if (data.errorCode == '1005'){
					return {
						'authenticated' : false,
						'message' : data.message,
						'errorCode' : data.errorCode,
						'instruction' : data.instruction
					};
				}

				// Check if there is an error
				if (self.checkError(null, data)){
					return self.$q.reject(self.synthError(data));
				}

				return {
					'authenticated' : true,
					'authToken' : data.authToken
				};
			}, () => {
				return self.$q.reject(self.synthError(1000));
			});
		}

		/*
		 * Get promise to update the user's auth token if there is one
		 */
		function getUpdateTokenPromise(successData){
			if(successData.authToken){
				return self.registrationService.mergeRegistration({'authToken' : successData.authToken, 'username' : username})
					.then(() => {
						return self.$q.when(successData);
					});
			}
			else{
				return self.$q.when(successData);
			}
		}

		return getAuthenticatePromise()
			.then(getUpdateTokenPromise);
	}

}

/**
 * Factory to create a new SynthesisRESTClient
 */
var SynthesisRESTClientFactory = function(){
	return new SynthesisRESTClient(...arguments);
};
SynthesisRESTClientFactory.$inject = ['$q', '$http', 'RegistrationService', 'SynthConfig', 'SynthCheckResponseError', 'SynthError', 'SynthAuthenticateUser'];
export default SynthesisRESTClientFactory;
