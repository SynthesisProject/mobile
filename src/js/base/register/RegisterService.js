'use strict';
/**
 * base/js/home/RegisterService.js
 *
 * Service that will handle registrations of modules.
 * This service interacts with SyncAPI to talk with external services,
 * and with DataService for writing files.
 */
var RegisterService = ($q, $filter, DataService, RegistrationService, SyncAPIService, LoggerService, _SF, CheckError, ModuleService) => {

	// A reference to a logger for this service
	var LOG = LoggerService('RegisterService');

	/**
	 * Constructor
	 */
	class RegisterServiceImpl{
		/**
		 * Initialises the application to use the specified array of modules
		 */
		initModules(modules){
			LOG.debug('initModules()');
			var self = this;
			let promise = $q.when();
			angular.forEach(modules, function(theModule){
				promise = promise.then(function(){
					return self._createModuleStructure(theModule.id);
				});
			});
			return promise;
		}

		/**
		 * Function to register for all modules in an array
		 */
		registerModules(modules){

			// Update registration data with the new module
			function markModuleLinked(module){
				return ModuleService.setModuleProperty(module.id, 'registered', true);
			}

			let promise = $q.when();
			angular.forEach(modules, function(theModule){
				promise = promise.then(function(){
					return SyncAPIService.updateModuleData(theModule.id)
						.then(function(){
							return markModuleLinked(theModule);
						});
				});
			});
			return promise;
		}


		/**
		 * Create the file structure for a module
		 */
		_createModuleStructure(moduleId){
			const self = this;

			/**
			 * Returns a promise to create all the tools
			 */
			function getCreateToolsPromise(tools){
				let promise = $q.when();
				angular.forEach(tools, function(tool){
					promise = promise.then(function(){
						return self._createToolDataFile(moduleId, tool.id);
					});
				});
				return promise;
			}

			/*
			 * Returns a promise to get the tools, and sets
			 * the tools variable
			 */
			function getModuleToolsPromise(){
				return self._getModuleTools(moduleId);
			}

			return this._createModuleDataFile(moduleId)
				.then(getModuleToolsPromise)
				.then(getCreateToolsPromise);
		}

		/**
		 * Create the file structure for a module
		 */
		_createModuleDataFile(moduleId){
			return ModuleService.createDefaultModuleFile(moduleId);
		}

		/**
		 * Create the data file for a tool
		 */
		_createToolDataFile(moduleId, toolId){
			return ModuleService.mergeToToolData(moduleId, toolId, {});
		}

		/**
		 * Get the tools used for the module
		 */
		_getModuleTools(moduleId){
			const deferred = $q.defer();
			ModuleService.getModuleData(moduleId).then(
				// Success
				(data) => {
					var tools = $filter('object2Array')(data.toolsLocal);
					if(LOG.isDEBUG()){
						LOG.debug('Got module tools : ' + JSON.stringify(tools));
					}
					deferred.resolve(tools);
				},
				// Failed
				(error) => {
					deferred.reject(error);
				});
			return deferred.promise;
		}
	}

	return new RegisterServiceImpl();
};
RegisterService.$inject = ['$q', '$filter', 'DataService', 'RegistrationService', 'SyncAPIService', 'LoggerService', 'SynthFail', 'SynthCheckResponseError', 'ModuleService'];
export default RegisterService;
