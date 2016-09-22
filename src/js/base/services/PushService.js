'use strict';

var PushService = ($q, $http, LoggerService, DataService, ModuleService, RegistrationService, SynthError, UserSession, SynthConfig, CheckError, $window, SynthesisRESTClient) => {

	var LOG = LoggerService('PushService');
	/**
	 * Constructor
	 */
	class PushServiceImpl{

		constructor() {
			this.deviceReady = false;
			this.push = null;
		}

		/**
		 * Invoked from the Push Cordova plugin when a notification is received
		 */
		_onNotificationReceived(data){
			SynthesisRESTClient.getPushMessage(data.additionalData.id).then((pushMessage) => {
				// A test message
				if(pushMessage.messageType === 1){
					navigator.notification.confirm(pushMessage.message, angular.noop, pushMessage.title, ['Ok']);
				/**
				 * If we are in the foreground and the message is an important one
				 * we will interupt the user with a dialog
				 */
				}
				else if(pushMessage.emergency === true || data.additionalData.foreground === false){
					// A tool update
					if(pushMessage.messageType === 2){
						var buttons = ['Ok', 'Cancel'],
							callback = (option) => {
								if(option == 1){
									$window.location = '#/sync';
								}
							};

						navigator.notification.confirm(pushMessage.message, callback, pushMessage.title, buttons);
					}
				}
			});
		}

		/**
		 * Invoked from the Push Cordova plugin when the registration is received
		 */
		_onRegistrationReceived(pushRegistration){
			LOG.debug('Registered! ' + pushRegistration.registrationId);
			var data = {
				'device' : {
					'platform' : device.platform,
					'model' : device.model,
					'uuid' : device.uuid,
					'regId' : pushRegistration.registrationId
				}
			};
			return this._sendRequest('register', 'POST', data, true);
		}

		/**
		 * Returns a promise that will be resolved when the cordova
		 * thinks the device is ready and you can use the API
		 */
		cordovaReady() {
			var deferred = $q.defer();
			const self = this;
			if (this.deviceReady === true) {
				deferred.resolve();
			}
			else {
				document.addEventListener('deviceready', () => {
					self.deviceReady = true;
					deferred.resolve();
				}, false);
			}
			return deferred.promise;
		}

		_sendRequest(url, method, requestData, appendAuthentication = false){
			return SynthesisRESTClient._doRequest(`/service-push/${url}`, method, requestData, appendAuthentication)
				.then((response) => {
					var responseData = response.data;
					// Check if there is an error
					if (CheckError(null, responseData)){
						return $q.reject(SynthError(responseData));
					}
					return responseData;
				},
				() => {
					return $q.reject(SynthError(1000));
				});
		}


		/**
		 * Register the device for push notifications.
		 * If notifications are not enabled for this application, it will just return.
		 * If the device is offline - ??
		 * If the device is online, this method will request a registration token and send
		 * it to the server.
		 */
		registerDevice() {

			// If push notifications are not enable we return
			if(!SynthConfig.pushEnabled){
				return $q.when(true);
			}
			return this.cordovaReady().then(() => {
				if(this.push == null){
					this.push = PushNotification.init({ 'android' : {'senderID' : SynthConfig.androidSenderID, 'image' : 'icon'}, 'ios' : {}});

					// Registration to GCM/APNS is completed and we received a token
					this.push.on('registration', (registrationData) => {
						this._onRegistrationReceived(registrationData);
					});

					// A notification message is received
					this.push.on('notification', (notificationData) => {
						this._onNotificationReceived(notificationData);
					});

					// Something went wrong
					this.push.on('error', (e) => {
						LOG.error(`Error Registering for PushNotifications: ${e.message}`);
					});
				}
			});
		}


		/**
		 * Get the current preferences saved locally
		 * When we get the preferences we need to delete the onces from the Server
		 * that are unknown to us
		 * Object format:
		 *  {
		 *		'moduleId1': {
		 *		    'announcements': false,
		 *		    'faq': false,
		 *		    'forums': false,
		 *		    'welcome': false,
		 *		    'schedule': false,
		 *		    'learning_units': false,
		 *		    'resources': false
		 *		  },
		 *		'moduleId1': {
		 *		    'announcements': false,
		 *		    'faq': false,
		 *		    'forums': false,
		 *		    'welcome': false,
		 *		    'schedule': false,
		 *		    'learning_units': false,
		 *		    'resources': false
		 *		  }
		 *	}
		 * }
		 */
		getPushToolPreferences(){
			// The preferences we are working with
			var preferences = {}, // What we are going to return
				// Preferences that we need to delete
				// This object will start off with all the preferences that are
				// on the server. As we detect known ones, it is removed from
				// the object. In the end this object will contain all the ones
				// we need to delete
				unkownPreferences;
			const self = this;
			function getServerPreferences(){
				return self._getToolPushPreferencesServer().then((sPreferences) => {
					unkownPreferences = sPreferences;
				});
			}

			// Get registered modules
			function getModules(){
				return ModuleService.getLinkedModules().then((mdls) => {
					return mdls;
				});
			}

			// Loop through each module
			function loopModules(modules){
				var promise = $q.when();
				angular.forEach(modules, function(module){
					promise = promise.then(function(){
						return checkModulePreferences(module.id);
					});
				});
				return promise;
			}

			// Get tool preferences for module
			function checkModulePreferences(moduleId){
				preferences[moduleId] = {};

				return ModuleService.getModuleData(moduleId).then((moduleData) => {
					// Tool description object from module.json
					var toolDescriptions = moduleData.toolDescriptions;

					// Get the preference for each tool
					for (var toolId in toolDescriptions) {
						if (toolDescriptions.hasOwnProperty(toolId)) {
							var tool = toolDescriptions[toolId];

							// Skip tools that are not displayed on the menu
							if(!tool.menu){
								continue;
							}

							if(unkownPreferences[moduleId] && unkownPreferences[moduleId][toolId] !== undefined){
								preferences[moduleId][toolId] = unkownPreferences[moduleId][toolId];
								delete unkownPreferences[moduleId][toolId];
								if(Object.keys(unkownPreferences[moduleId]).length === 0){
									delete unkownPreferences[moduleId];
								}
							}

							// The preference will be null if it is a
							// preference not yet set on the server
							if(preferences[moduleId][toolId] == null){
								preferences[moduleId][toolId] = false;
							}
						}
					}
				});
			}

			/**
			 * Sends requests to the server to delete the unkown preferences
			*/
			function deleteUnknownPreferences(){
				if(Object.keys(unkownPreferences).length === 0){
					return $q.when(true);
				}
				else{
					return self._sendRequest(`preferences/${device.uuid}`, 'DELETE', {toolPreferences : unkownPreferences}, true);
				}
			}

			return getServerPreferences()
				.then(getModules)
				.then(loopModules)
				.then(deleteUnknownPreferences)
				.then(() => {
					return preferences;
				});
		}

		/**
		 * Gets the push preferences from the server
		 */
		_getToolPushPreferencesServer(){
			return this._sendRequest(`preferences/${device.uuid}`, 'GET')
				.then((data) => {
					return data.map.toolPreferences;
				});
		}

		/**
		 * Update the push preferences for this devices.
		 * It first attempts to update on the Synthesis Server
		 * then persists locally
		 *
		 * Object format:
		 * {
		 * 		'moduleId' : {
		 * 			'toolId' : true/false,
		 * 			'toolId' : true/false,
		 * 			etc ...
		 * 		},
		 *      etc ...
		 *
		 * }
		 *
		 */
		updatePushPreferences(preferences) {
			var sendData = {
				'toolPreferences' : preferences
			};

			return this._sendRequest(`preferences/${device.uuid}`, 'POST', sendData, true)
			.then((data) => {

				// Check if there is an error
				if (CheckError(null, data)){
					return $q.reject(SynthError(data));
				}

				return data.map.toolPreferences;
			});
		}

		/**
		 *
		 */
		enablePushForModule(moduleId) {
			return this.setPushPreferenceForModule(moduleId, true);
		}

		disablePushForModule(moduleId) {
			return this.setPushPreferenceForModule(moduleId, false);
		}

		/**
		 * Enable push notifications for a module
		 */
		setPushPreferenceForModule(moduleId, enabled) {
			const self = this;
			function updateRegistrationDataPromise(){
				// Update in the settings
				var mergeData = { 'modules' : {} };
				mergeData.modules[moduleId] = { 'pushEnabled' : true };
				return RegistrationService.mergeRegistration(mergeData);
			}


			function updatePushSettingToServerPromise(){
				var data = {
					'uuid' : device.uuid,
					'sender' : `module.${moduleId}`,
					'enabled' : enabled
				};
				return self._sendRequest('preference', 'POST', data, true);
			}

			// Send request to the server
			return updateRegistrationDataPromise()
				.then(updatePushSettingToServerPromise);
		}

	}

	return new PushServiceImpl();
};
PushService.$inject = ['$q', '$http', 'LoggerService', 'DataService', 'ModuleService', 'RegistrationService', 'SynthError', 'UserSession', 'SynthConfig', 'SynthCheckResponseError', '$window', 'SynthesisRESTClient'];
export default PushService;
