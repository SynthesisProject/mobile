'use strict';

/**
* Session object used for logins
*/
class UserSession {
	constructor() {
		/**
		 * Username of the active user
		 */
		this.username = null;

		/**
		 * Authentication token to synthesis service
		 */
		this.authToken = null;

		/**
		 * ID of this device
		 */
		this.deviceId = null;

		/**
		 * Map of modules the user is registered for
		 */
		this.modules = {};

		/**
		 * Flag if the user is registered for atleast one module
		 */
		this.registered = false;
	}

	/**
	 * Update more complex attributes of the user session
	 */
	updateSession(userSession){
		for(var prop in userSession){
			this[prop] = userSession[prop];
		}
	}

	/*
	 * Clear entire session
	 */
	clearSession(){
		for(var prop in this){
			if(typeof(this[prop]) === 'function'){
				continue;
			}
			this[prop] = null;
		}
	}
}

/**
 * Factory to create instances of the UserSession class
 */
export default function UserSessionFactory(){
	return new UserSession();
}
