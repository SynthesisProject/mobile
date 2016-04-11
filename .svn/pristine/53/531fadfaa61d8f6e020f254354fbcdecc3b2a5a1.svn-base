'use strict';
import {convertToObject} from '../Utilities';
var ModuleService = ($q, DataService, RegistrationService, LoggerService, _SF, SynthQLoop, $filter, safo, SynthError, SynthesisRESTClient) => {
	var LOG = LoggerService('ModuleService');


	// Cache of module data
	var moduleDataCache = {};

	// Return the factory
	class ModuleServiceImpl {

		/**
		 * Return the modules the user has linked with this application
		 *
		 * @returns an array of modules that are linked to the application
		 * [
		 *   {
		 *		"id": "module1",
		 *		"name": "Course 1",
		 *		"description": "Course 1",
		 *		"createdDate": "20140627145828000",
		 *		"isRegistered": true
		 *	},
		 *	{
		 *		"id": "module2",
		 *		"name": "Course 2",
		 *		"description": "",
		 *		"createdDate": "20141128133105000",
		 *		"isRegistered": true
		 *	}
		 * ]
		 */
		getLinkedModules(){
			return RegistrationService.getRegistration().then((registrationData) => {
				var filteredModules = [];
				if(registrationData.modules){
					var modulesArray = $filter('object2Array')(registrationData.modules);
					filteredModules = _.filter(modulesArray, 'registered', true);
				}
				return filteredModules;
			});
		}

		/**
		 * Gets all the currently known modules. This include ones that that use
		 * is registered for or not
		 */
		getCurrentModules(){
			return RegistrationService.getRegistration().then((registrationData) => {
				if(registrationData.modules){
					return $filter('object2Array')(registrationData.modules);
				}
				return [];
			});
		}

		/**
		 * Returns an array of modules that are newly available from the
		 * Synthesis Server that we do not currently have knowledge of
		 */
		getNewModules(){
			var availableModules;
			const self = this;

			function getCurrentlyKnownModules(synthesisModules){
				availableModules = synthesisModules;
				return self.getCurrentModules();
			}

			function findNewArray(currentModules){
				// If we currently have no modules, all available morules are new
				if(currentModules.length === 0){
					return $q.when(availableModules);
				}

				var newModules = [];
				_.forEach(availableModules, (availableModule) => {
					// look in our current array if we have such an item
					var matchedModule = _.find(currentModules, 'id', availableModule.id);

					// If none matched, its a new matchedModule
					if(matchedModule == null){
						newModules.push(availableModule);
					}
				});
				return $q.when(newModules);
			}
			return SynthesisRESTClient.getAllowedSites()
				.then(getCurrentlyKnownModules)
				.then(findNewArray);
		}

		hasNewModules(){
			return this.getNewModules()
				.then((newModules) => {
					return newModules.length > 0;
				});
		}

		/**
		 * Sets a property on the specified module
		 */
		setModuleProperty(moduleId, property, value){
			var mergeData = { 'modules' : {}};
			mergeData.modules[moduleId] = {};
			mergeData.modules[moduleId][property] = value;
			return RegistrationService.mergeRegistration(mergeData);
		}

		/**
		 * Returns the modules that are available that we know of, and what
		 * the Syntehsis Server has to offer
		 *
		 * @returns a array of modules that are linked to the application
		 * [{
		 *		"id": "module1",
		 *		"name": "Course 1",
		 *		"description": "Course 1",
		 *		"createdDate": "20140627145828000",
		 *		"isRegistered": true
		 *	},{
		 *		"id": "module2",
		 *		"name": "Course 2",
		 *		"description": "",
		 *		"createdDate": "20141128133105000",
		 *		"isRegistered": false | undefined
		 *	}
		 *]

		'getAvailableModules' : function(){
			var service = this;
			// Calculate what the new map should look like
			function calculateNewMap(newModules){
				return service.getLinkedModules().then((currentModulesArray) => {
					// If there are no new modules, we can return what we currently have
					if(newModules.length == 0){
						return currentModulesArray;
					}

					// Else we need to merge the new modules

					var mergeMap = { modules : {}};

					_.forEach(newModules, (newModule) => {
						// look in our current array if we have such an item
						var matchedModule = _.find(currentModulesArray, 'id', newModule.id);
						if(matchedModule == null){
							mergeMap.modules[newModule.id] = newModule;
						}
					});

					return mergeNewModules(mergeMap);
				});
			}

			// Merge the new modules that we calculated to the registration data
			function mergeNewModules(newMergeData){
				return RegistrationService.mergeRegistration(newMergeData).then((registrationData) => {
					return $filter('object2Array')(registrationData.modules);
				});
			}

			return this.getNewModules().then(calculateNewMap);
		},
 	*/

		/**
		 * Gets all the tools of linked modules. This data return will be in a similar format as:
		 * [{
		 *		'id': 'trailrunning',
		 *		'name': 'Trailrunning 201',
		 *		'description': '',
		 *		'createdDate': '20141128133105000',
		 *		'tools :
		 *			[{
		 *				'defaultPage': '#tool/faq',
		 *				'name': 'faq',
		 *				'label': 'FAQs',
		 *				'heading': 'FAQs',
		 *				'icon': 'icon-sakai-help',
		 *				'description': '',
		 *				'menu': false,
		 *				'seq': 40
		 *			},
		 *			{
		 *				'defaultPage': '#tool/forums',
		 *				'name': 'forums',
		 *				'label': 'Discussions',
		 *				'heading': 'Discussions',
		 *				'icon': 'icon-sakai-forums',
		 *				'description': '',
		 *				'menu': false,
		 *				'seq': 60
		 *			}]
			* }]
		 */
		getAllHomeToolsSorted(){
			var modules, idx = 0,
				moduleTools = [];
			const self = this;

			function getModuleToolsPromise(){
				if(modules == null || idx >= modules.length) {
					return null;
				}

				var theModule = modules[idx++];
				return self.getModuleHomeToolsSorted(theModule.id)
					.then((tools) => {
						moduleTools.push(theModule);
						moduleTools[moduleTools.length - 1].tools = tools;
					});
			}

			function getLoopModulesPromise(availableModules){
				modules = availableModules;
				return SynthQLoop(getModuleToolsPromise).then(() => {
					return moduleTools;
				});
			}

			return this.getLinkedModules().then(getLoopModulesPromise);
		}

		/**
		 * Creates the default module.json file for the module
		 */
		createDefaultModuleFile(moduleId){
			return DataService.copyFromWebToFile('base/data/module.json', 'data', `${moduleId}.json`);
		}

		/**
		 * Gets the data for the specified module ID
		 */
		getModuleData(moduleId){
			if(moduleDataCache[moduleId] != null){
				return $q.when(moduleDataCache[moduleId]);
			}
			else{
				return DataService.getDataFile(`${moduleId}.json`).then((moduleData) => {
					moduleDataCache[moduleId] = moduleData;
					return moduleData;
				});
			}
		}

		/**
		 * Return the proper display name for a module
		 */
		getModuleName(moduleId){
			return this.getLinkedModules().then((registrationData) => {
				var theModule = _.find(registrationData, { 'id' : moduleId});
				return theModule ? theModule.name : null;
			});
		}

		/**
		 * Return the proper display name for a module's tool
		 */
		getToolName(moduleId, toolId){
			return this.getModuleData(moduleId).then((moduleData) => {
				// First check if we have such a field
				if(moduleData && moduleData.toolDescriptions && moduleData.toolDescriptions[toolId]){
					return moduleData.toolDescriptions[toolId].heading;
				}
				return null;

			});
		}


		/**
		 * Get the home tools for a module
		 */
		getModuleHomeTools(moduleId){
			return this.getModuleData(moduleId)
				.then((moduleData) => {
					var tools = moduleData.toolDescriptions;
					var availableTools = $filter('object2Array')(tools);
					availableTools = $filter('filter')(availableTools, {menu : true});
					safo(availableTools, 'moduleId', moduleId);
					return availableTools;
				});
		}


		/**
		 * Get the home tools for a module sorted
		 */
		getModuleHomeToolsSorted(moduleId){
			return this.getModuleHomeTools(moduleId)
				.then(function(tools){
					// TODO implement user custom sorting
					return $filter('orderBy')(tools, 'seq');
				});
		}


		/**
		 * Merge data to a module's data file.
		 *
		 * @param moduleId - ID of the module to merge too
		 * @jsonData - Data to merge. Data can be a JSON string or a JSON object
		 */
		mergeToModuleData(moduleId, jsonData){
			return DataService.mergeDataFile(`${moduleId}.json`, jsonData).then((data) => {
				moduleDataCache[moduleId] = data;
				return data;
			});
		}


		/**
		 * Gets the data for a tool
		 * @param moduleId - ID of the module in which the tool is
		 * @param toolname - Name of the tool to get data of
		 * @param isUploadData - Indication if the data is the upload data (optional, default=false)
		 */
		getToolData(moduleId, toolname, isUploadData){
			LOG.debug('Getting data for tool : ' + moduleId + ' - ' + toolname);
			var deferred = $q.defer();
			DataService.getToolDataFile(moduleId, toolname, isUploadData)
				.then(
				// Success
				function(fileEntry){
					DataService.getFileAsObject(fileEntry)
						.then(
						// Success
						function(object){
							deferred.resolve(object);
						}, fail);
				}, fail);

			function fail(error){
				deferred.reject(error);
			}
			return deferred.promise;
		}

		/**
		 * Gets a merge of the downloaded and (still-to) upload data for a tool
		 *
		 * @param moduleId Module in which the tool is
		 * @param toolname Name of the tool
		 */
		getMergedToolData(moduleId, toolname){
			var toolData, toolUploadData;
			const self = this;
			function getToolDataPromise(){
				return self.getToolData(moduleId, toolname, true).then((data) => {
					toolData = data;
				});
			}

			function getToolUploadDataPromise(){
				return self.getToolData(moduleId, toolname, false).then((data) => {
					toolUploadData = data;
				});
			}

			function getMergedDataPromise(){
				var mergedData = jQuery.extend(true, toolData, toolUploadData);
				return $q.when(mergedData);
			}

			return getToolDataPromise()
				.then(getToolUploadDataPromise)
				.then(getMergedDataPromise);
		}


		/**
		 * Merges data to a tool's data file.
		 * This will typically by used when downloading sync'd content and merge it to a file
		 *
		 * @param moduleId - Module ID in which the tool is
		 * @param toolname - Name of the tool to write data too
		 * @param jsonData - Either a JSON String, or a JSON Object representing the data to write
		 * @param isUploadData - Flag if the data should be merged to the upload data of the tool
		 * @returns A promise with the data that was merged as the parameters
		 */
		mergeToToolData(moduleId, toolname, jsonData, isUploadData){
			var deferred = $q.defer();
			this.getToolData(moduleId, toolname, isUploadData).then(
				// Success
				function(data){
					var jsonObject = convertToObject(jsonData);
					var writeObject = jQuery.extend(true, data, jsonObject);
					// Write the merged data to the file
					DataService.writeToolData(moduleId, toolname, writeObject, isUploadData).then(
						// Success
						function(){
							deferred.resolve(writeObject);
						},
						//Fail
						function (){
							deferred.reject(SynthError(1004));
						}
					);
				}
			);

			return deferred.promise;
		}

	}

	return new ModuleServiceImpl();
};
ModuleService.$inject = ['$q', 'DataService', 'RegistrationService', 'LoggerService', 'SynthFail', 'SynthQLoop', '$filter', 'safo', 'SynthError', 'SynthesisRESTClient'];
export default ModuleService;
