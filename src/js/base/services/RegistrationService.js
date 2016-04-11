'use strict';

var RegistrationService = ($q, $rootScope, DataService) => {

	class RegistrationServiceImpl{

		constructor(){
			// Cache of settings so that we don't have to read the file each time
			this.cachedRegistration = null;

			// Clear cache on event
			$rootScope.$on('app.clearAllCache', () => {
				this.cachedRegistration = null;
			});
		}


		mergeRegistration(registrationData){
			return DataService.mergeToFile('', 'registration.json', registrationData)
			.then((newRegistrationData) => {
				// Update our cache with what is now the contents of the file
				this.cachedRegistration = newRegistrationData;

				// Broadcast changes to the registration
				$rootScope.$broadcast('registrationDataChanged', newRegistrationData);
				return newRegistrationData;
			});
		}

		/**
		* Read the settings from the file and update the cache
		*/
		getRegistration(){
			// If we don't have cached settings, we get it from the file
			if(this.cachedRegistration == null){
				return DataService.getFileData('', 'registration.json')
				.then((registration) => {
					// Cache what we just read
					this.cachedRegistration = registration;

					// Broadcast changes to the registration
					$rootScope.$broadcast('registrationDataChanged', registration);
					return registration;
				});
			// Else we use the cached settings
			}
			else{
				return $q.when(this.cachedRegistration);
			}
		}
	}

	return new RegistrationServiceImpl();
};
RegistrationService.$inject = ['$q', '$rootScope', 'DataService'];
export default RegistrationService;
