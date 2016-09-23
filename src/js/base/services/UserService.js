'use strict';

class UserService {

	constructor(RegistrationService){
		this.registrationService = RegistrationService;

		/**
		 * The user hasn't been authenticated yet
		 */
		this.PROGRESS_AUTHENTICATE = 0;

		/**
		 * The user still needs to register for at least one module
		 */
		this.PROGRESS_SELECT_MODULES = 1;

		/**
		 * The user registration is complete for at least on module
		 */
		this.PROGRESS_COMPLETED = 2;
	}

	/**
	 * Gets the progress of the user registration. Posible returning values are
	 * UserService.PROGRESS_AUTHENTICATE
	 * UserService.PROGRESS_SELECT_MODULES
	 * UserService.PROGRESS_COMPLETED
	 */
	getRegistrationProgress(){
		var self = this;
		return this.registrationService.getRegistration()
			.then(function(data){
				/*
				 * If there isn't even a username and auth token yet
				 * then the user hasn't been authenticated
				 */
				if(data == null || data.username == null){
					return self.PROGRESS_AUTHENTICATE;
				}
				/*
				 * If there is no modules yet, then the user hasn't selected
				 * modules to use on the app
				 */
				else if(data.modules == null){
					return self.PROGRESS_SELECT_MODULES;
				}
				/*
				 *  If none of the above failed, then the user
				 *  has a complete registration.
				 */
				else{
					return self.PROGRESS_COMPLETED;
				}
			});
	}

	/**
	 * Returns true if the user is registered for atleast one module
	 */
	isRegistered(){
		var self = this;
		return self.getRegistrationProgress().then((progress) => {
			return progress == self.PROGRESS_COMPLETED;
		});
	}

	/**
	 * Return true if the user is completely registered
	 */
	isRegistrationComplete(){
		return this.getRegistrationProgress().then((progress) => {
			return this.PROGRESS_COMPLETED == progress;
		});
	}

}

var UserServiceFactory = function(){
	return new UserService(...arguments);
};
UserServiceFactory.$inject = ['RegistrationService'];
export default UserServiceFactory;
