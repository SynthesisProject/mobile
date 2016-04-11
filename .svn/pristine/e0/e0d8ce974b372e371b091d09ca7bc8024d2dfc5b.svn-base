'use strict';
/**
 * base/js/home/RegisterService.js
 *
 * Service that will handle registrations of modules.
 * This service interacts with SyncAPI to talk with external services,
 * and with DataService for writing files.
 */
var RegisterService = ($q, $filter, DataService, RegistrationService, SyncAPIService, LoggerService, _SF, CheckError, SynthQLoop, ModuleService) => {

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
			/*
			 * Function that will return a promise if there are more modules
			 * to create
			 */
			var cIdx = 0;
			function getCreateModulePromise(){

				// If there are no more modules return null
				if(cIdx == modules.length) {
					return null;
				}

				// Else return a promise to create the module structure
				return self._createModuleStructure(modules[cIdx++].id);
			}

			return SynthQLoop(getCreateModulePromise);
		}

		/**
		 * Function to register for all modules in an array
		 */
		registerModules(modules){

			// Update registration data with the new module
			function markModuleLinked(module){
				return ModuleService.setModuleProperty(module.id, 'registered', true);
			}

			// Returns a promise to register a module
			var mIdx = 0;
			function getRegisterPromise(){

				// If there are no more modules return null
				if(mIdx == modules.length){
					return null;
				}

				var module = modules[mIdx++];
				return SyncAPIService.updateModuleData(module.id)
					.then(function(){
						return markModuleLinked(module);
					});
			}

			// Start registering all modules
			return SynthQLoop(getRegisterPromise);
		}


		/**
		 * Create the file structure for a module
		 */
		_createModuleStructure(moduleId){
			var tools;
			const self = this;
			/*
			 * Returns a promise to create the directories for a tool
			 */
			var tIdx = 0;
			function getCreateToolPromise(){

				// If there are no more modules return null
				if(tIdx == tools.length){
					return null;
				}

				var tool = tools[tIdx++];
				return self._createToolDataFile(moduleId, tool.id);
			}

			/*
			 * Returns a promise to get the tools, and sets
			 * the tools variable
			 */
			function getModuleToolsPromise(){
				return self._getModuleTools(moduleId)
					.then((moduleTools) => {
						tools = moduleTools;
					});
			}

			return this._createModuleDataFile(moduleId)
				.then(getModuleToolsPromise)
				.then(SynthQLoop(getCreateToolPromise));
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
RegisterService.$inject = ['$q', '$filter', 'DataService', 'RegistrationService', 'SyncAPIService', 'LoggerService', 'SynthFail', 'SynthCheckResponseError', 'SynthQLoop', 'ModuleService'];
export default RegisterService;
