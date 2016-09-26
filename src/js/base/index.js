'use strict';
// Import base controllers
import BootCtrl from './boot/BootCtrl';
import HomeCtrl from './home/HomeCtrl';
import RegisterCtrl from './register/RegisterCtrl';
import RegisterModuleRegistrationCtrl from './register/RegisterModuleRegistrationCtrl';
import RegisterSelectModuleCtrl from './register/RegisterSelectModuleCtrl';
import SettingsCtrl from './settings/SettingsCtrl';
import SettingsPushCtrl from './settings/SettingsPushCtrl';
import SyncCtrl from './sync/SyncCtrl';
import SyncConfigureCtrl from './sync/SyncConfigureCtrl';
import SyncProgressCtrl from './sync/SyncProgressCtrl';
import AppController from './controllers/AppController';

// Import base factories
import HomeService from './home/HomeService';
import RegisterService from './register/RegisterService';
import RegistrationService from './services/RegistrationService';
import DataService from './services/DataService';
import LoggerService from './services/LoggerService';
import ModuleService from './services/ModuleService';
import PushService from './services/PushService';
import SyncAPIService from './services/SyncAPIService';
import UserService from './services/UserService';
import UserSettings from './services/UserSettings';
import SyncService from './sync/SyncService';
import SyncSelection from './sync/SyncSelection';
import SynthesisRESTClient from './services/SynthesisRESTClient';

import safo from './factories/safo';
import SynthError from './factories/SynthError';
import SynthFail from './factories/SynthFail';
import SynthCheckResponseError from './factories/SynthCheckResponseError';
import SynthErrorHandler from './factories/SynthErrorHandler';
import SynthAuthenticateUser from './factories/SynthAuthenticateUser';
import UserSession from './factories/UserSession';
import Lock from './factories/Lock';


// Import base filters
import NoEscapeFilter from './filters/NoEscapeFilter';
import Object2ArrayFilter from './filters/Object2ArrayFilter';
import ArrayToObjectFilter from './filters/ArrayToObjectFilter';
import FormatDateFilter from './filters/FormatDateFilter';
import BytesToSizeFilter from './filters/BytesToSizeFilter';
import AttachmentsFilter from './filters/AttachmentsFilter';

// Import providers
import SynthAttachmentMinerProvider from './handlers/SynthAttachmentMinerProvider';
import SynthEmbeddedImageHandlerProvider from './handlers/SynthEmbeddedImageHandlerProvider';
import SynthDeleteHandlerProvider from './handlers/SynthDeleteHandlerProvider';
import SynthLinkHandlerProvider from './handlers/SynthLinkHandlerProvider';
import SynthUploadResponseHandlerProvider from './handlers/SynthUploadResponseHandlerProvider';


// Import base directives
import SynthMenu from './directives/SynthMenu';
import SynthFooter from './directives/SynthFooter';
import ToolSyncStatus from './directives/ToolSyncStatus';
import OverallSyncStatus from './directives/OverallSyncStatus';
import SynthAttachments from './directives/SynthAttachments';
import ModuleCollapse from './directives/ModuleCollapse';
import AnimatedEllipse from './directives/AnimatedEllipse';
import CurrentModuleName from './directives/CurrentModuleName';
import ModuleName from './directives/ModuleName';
import ToolName from './directives/ToolName';

import Routes from './Routes';

var base = 'synthesis.base',
	controllers = 'synthesis.controllers',
	factories = 'synthesis.factories',
	filters = 'synthesis.filters',
	directives = 'synthesis.directives',
	providers = 'synthesis.providers';

// Register controllers
angular.module(controllers, [])
	.controller('BootCtrl', BootCtrl)
	.controller('HomeCtrl', HomeCtrl)
	.controller('RegisterCtrl', RegisterCtrl)
	.controller('RegisterModuleRegistrationCtrl', RegisterModuleRegistrationCtrl)
	.controller('RegisterSelectModuleCtrl', RegisterSelectModuleCtrl)
	.controller('SettingsCtrl', SettingsCtrl)
	.controller('SettingsPushCtrl', SettingsPushCtrl)
	.controller('SyncCtrl', SyncCtrl)
	.controller('SyncConfigureCtrl', SyncConfigureCtrl)
	.controller('SyncProgressCtrl', SyncProgressCtrl)
	.controller('AppController', AppController);

// Register factories
angular.module(factories, [])
	.factory('HomeService', HomeService)
	.factory('RegisterService', RegisterService)
	.factory('RegistrationService', RegistrationService)
	.factory('DataService', DataService)
	.factory('LoggerService', LoggerService)
	.factory('ModuleService', ModuleService)
	.factory('PushService', PushService)
	.factory('SyncAPIService', SyncAPIService)
	.factory('UserService', UserService)
	.factory('UserSettings', UserSettings)
	.factory('UserSession', UserSession)
	.factory('SyncService', SyncService)
	.factory('SyncSelection', SyncSelection)
	.factory('safo', safo)
	.factory('SynthError', SynthError)
	.factory('SynthFail', SynthFail)
	.factory('SynthCheckResponseError', SynthCheckResponseError)
	.factory('SynthErrorHandler', SynthErrorHandler)
	.factory('SynthAuthenticateUser', SynthAuthenticateUser)
	.factory('SynthesisRESTClient', SynthesisRESTClient)
	.factory('Lock', Lock);

// Register filters
angular.module(filters, [])
	.filter('noEscape', NoEscapeFilter)
	.filter('object2Array', Object2ArrayFilter)
	.filter('array2Object', ArrayToObjectFilter)
	.filter('formatDate', FormatDateFilter)
	.filter('bytesToSize', BytesToSizeFilter)
	.filter('attachments', AttachmentsFilter);

// Register directives
angular.module(directives, [])
	.directive('synthMenu', SynthMenu)
	.directive('synthFooter', SynthFooter)
	.directive('toolSyncStatus', ToolSyncStatus)
	.directive('overallSyncStatus', OverallSyncStatus)
	.directive('synthAttachments', SynthAttachments)
	.directive('moduleCollapse', ModuleCollapse)
	.directive('animatedEllipse', AnimatedEllipse)
	.directive('currentModuleName', CurrentModuleName)
	.directive('moduleName', ModuleName)
	.directive('toolName', ToolName);

// Register providers
angular.module(providers, [])
	.provider('SynthAttachmentMiner', SynthAttachmentMinerProvider)
	.provider('SynthEmbeddedImageHandler', SynthEmbeddedImageHandlerProvider)
	.provider('SynthDeleteHandler', SynthDeleteHandlerProvider)
	.provider('SynthLinkHandler', SynthLinkHandlerProvider)
	.provider('SynthUploadResponseHandler', SynthUploadResponseHandlerProvider);

// Create base module
angular.module(base, [
	providers,
	controllers,
	factories,
	filters,
	directives
]).config(Routes);

export default base;
