'use strict';

/**
* Session object used for logins
*/
var UserSession = () => {
	return {
		// Username of the active user
		'username' : null,

		// Authentication token to synthesis service
		'authToken' : null,

		// ID of this device
		'deviceId' : null,

		// Map of modules the user is registered for
		'modules' : {},

		// Flag if the user is registered for atleast one module
		'registered' : false,

		// Update more complex attributes of the user session
		'updateSession' : function(userSession){
			for(var prop in userSession){
				this[prop] = userSession[prop];
			}
		},

		// Clear entire session
		'clearSession' : function(){
			for(var prop in this){
				if(typeof(this[prop]) === 'function'){
					continue;
				}
				this[prop] = null;
			}
		}
	};
};
UserSession.$inject = [];
export default UserSession;
