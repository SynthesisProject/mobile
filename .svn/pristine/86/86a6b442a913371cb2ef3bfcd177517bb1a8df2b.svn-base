'use strict';

/**
* Configure routes for base application
* Do not configure tool specific routes here!
*/
var Routes = ($routeProvider, $compileProvider) => {

	// Allow cordova files for image src
	$compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|cdvfile|ms-appx|x-wmapp0e):|data:image\//);
	$compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

	$routeProvider
	.when('/boot',						{templateUrl : 'base/partials/boot.html',				controller : 'BootCtrl'})
	.when('/boot/:moduleId',			{templateUrl : 'base/partials/boot.html',				controller : 'BootCtrl'})
	.when('/home',						{templateUrl : 'base/partials/toolSelect.html',			controller : 'HomeCtrl'})
	.when('/settings', 					{templateUrl : 'base/partials/settings.html',			controller : 'SettingsCtrl' })
	.when('/settings-push', 			{templateUrl : 'base/partials/settings-push.html',		controller : 'SettingsPushCtrl' })
	.when('/sync', 						{templateUrl : 'base/partials/sync.html',				controller : 'SyncCtrl' })
	.when('/sync-configure', 			{templateUrl : 'base/partials/sync-configure.html',		controller : 'SyncConfigureCtrl' })
	.when('/sync-progress', 			{templateUrl : 'base/partials/sync-progress.html',		controller : 'SyncProgressCtrl' })
	.when('/register', 					{templateUrl : 'base/partials/login.html',				controller : 'RegisterCtrl' })
	.when('/register-selectModules',	{templateUrl : 'base/partials/selectModules.html',		controller : 'RegisterSelectModuleCtrl' })
	.when('/register-modulesRegistration', {templateUrl : 'base/partials/registerModules.html',	controller : 'RegisterModuleRegistrationCtrl' })
	.otherwise({ redirectTo : '/boot' });
};
Routes.$inject = ['$routeProvider', '$compileProvider'];
export default Routes;
