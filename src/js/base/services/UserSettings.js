'use strict';

/**
 * Service handeling user settings
 */
class UserSettings {

	constructor($q, $rootScope, DataService){
		this.$q = $q;
		this.$rootScope = $rootScope;
		this.dataService = DataService;
		/*
		 * Cache of settings so that we don't have to read the file each time
		 */
		this.cachedSettings = null;

		/*
		 * When we first read the settings, we need to make sure it is
		 * up to date with the settings that the application provides
		 */
		this.firstRun = true;

		// Clear cache on event
		$rootScope.$on('app.clearAllCache', () => {
			this.cachedSettings = null;
		});
	}

	/**
	 * Merge the settings to settings.json
	 */
	mergeSettings(settings){
		return this.dataService.mergeToFile('', 'settings.json', settings)
			.then((newSettings) => {
				// Update our cache with what is now the contents of the file
				this.cachedSettings = newSettings;
				return newSettings;
			});
	}

	/**
	 * Merge the settings file to make sure it contains the
	 * settings that ship with the app
	 */
	_mergeBaseSettings(){
		var self = this;

		// Promise to get the base settings
		function getBaseSettingPromise(){
			return self.dataService.getWebData('base/data/settings.json');
		}

		// Promise to persist the settings
		function getPersistSettingsPromise(baseSettings){
			return self.mergeSettings(baseSettings);
		}

		return getBaseSettingPromise()
			.then(getPersistSettingsPromise);
	}

	/**
	 * Read the settings from the file and update the cache
	 */
	getSettings(){
		// On first run we make sure to merge the application provided
		// settings with the user's file
		if(this.firstRun){
			this.firstRun = false;
			return this._mergeBaseSettings();
		}
		else{
			// If we don't have cached settings, we get it from the file
			if(this.cachedSettings == null){
				return this.dataService.getFileData('', 'settings.json')
					.then((settings) => {
						// Cache what we just read
						this.cachedSettings = settings;
						return settings;
					});
			}
			// Else we use the cached settings
			else{
				return this.$q.when(this.cachedSettings);
			}
		}
	}

	saveSettings(newSettings){
		return this.mergeSettings(newSettings);
	}
}

/**
 * Factory to create a new UserSettings service
 */
var UserSettingsFactory = function(){
	return new UserSettings(...arguments);
};
UserSettingsFactory.$inject = ['$q', '$rootScope', 'DataService'];
export default UserSettingsFactory;
