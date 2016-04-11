'use strict';
/**
* Default fail method that rejects a deferred
* by passing the error as the reason.
*/
var SynthCheckResponseError = (SynthError, LoggerService, RegistrationService) => {

	var LOG = LoggerService('SynthCheckResponseError');

	return function(deferred, response){

		/*
		* If authentication failed, we will remove the auth token
		* from our saved file and from the UserSession
		*/
		if(response.errorCode === 2002){
			var newData = {
				'authToken' : null
			};
			RegistrationService.mergeRegistration(newData);// There might be a little sync issue here
		}

		/* If there is no status field, all is good */
		if (response.status === undefined) {
			// Return false; there was no error
			return false;
		}

		/* If the response from the server had a status of 'SUCCESS', all is
		* good and no need to reject */
		else if (response.status === 'SUCCESS') {
			// Return false; there was no error
			return false;
		}
		/* If the response from the server did not have a status of 'SUCCESS'
		* we have to reject the promise. We create a new SynthError by passing
		* the server response. */
		else{
			if(LOG.isWARN()){
				LOG.warn('Got error response : ' + JSON.stringify(response));
			}
			if(deferred != null){
				deferred.reject(SynthError(response));
			}
			// Return true; there was an error
			return true;
		}
	};
};
SynthCheckResponseError.$inject = ['SynthError', 'LoggerService', 'RegistrationService'];
export default SynthCheckResponseError;
