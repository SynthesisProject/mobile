'use strict';

class RegistrationService{

	constructor($q, $rootScope, DataService){
		this.$q = $q;
		this.$rootScope = $rootScope;
		this.dataService = DataService;

		/**
		 * Cache of settings so that we don't have to read the file each time
		 */
		this.cachedRegistration = null;

		// Clear cache on event
		$rootScope.$on('app.clearAllCache', () => {
			this.cachedRegistration = null;
		});
	}


	mergeRegistration(registrationData){
		return this.dataService.mergeToFile('', 'registration.json', registrationData)
		.then((newRegistrationData) => {
			// Update our cache with what is now the contents of the file
			this.cachedRegistration = newRegistrationData;

			// Broadcast changes to the registration
			this.$rootScope.$broadcast('registrationDataChanged', newRegistrationData);
			return newRegistrationData;
		});
	}

	/**
	* Read the settings from the file and update the cache
	*/
	getRegistration(){
		// If we don't have cached settings, we get it from the file
		if(this.cachedRegistration == null){
			return this.dataService.getFileData('', 'registration.json')
			.then((registration) => {
				// Broadcast changes to the registration
				if(registration != null){
					// Cache what we just read
					this.cachedRegistration = registration;
					this.$rootScope.$broadcast('registrationDataChanged', registration);
				}

				return registration;
			});
		// Else we use the cached settings
		}
		else{
			return this.$q.when(this.cachedRegistration);
		}
	}

}

var RegistrationServiceFactory = function(){
	return new RegistrationService(...arguments);
};
RegistrationServiceFactory.$inject = ['$q', '$rootScope', 'DataService'];
export default RegistrationServiceFactory;
