'use strict';
var BootCtrl = ($q, $rootScope, $location, $routeParams, $timeout, DataService, UserService,
	HomeService, SyncAPIService, SynthErrorHandler, SyncService, PushService,
	UserSettings, ModuleService) => {
	$rootScope.activePage = 'boot';
	$rootScope.breadcrumbs = null;
	navigator.splashscreen.show();
	let disableListener = $rootScope.$on('$locationChangeSuccess', function(){
		disableListener();
		$timeout(function(){
			navigator.splashscreen.hide();
		}, 1500);
	});

	var settings;
	// Make sure there is a no media scan file in place
	var funcGetSettings = function(){
			return UserSettings.getSettings().then(function(userSettings){
				settings = userSettings;
			});
		},

		funcCheckNoMediaFile = function(){
			return DataService.ensureNoMediaScanFiles();
		},
		// Check if the user is registered
		funcCheckRegistrationProgress = function(){
			return UserService.getRegistrationProgress();
		},
		funcGoHomePromise = function(){
			return HomeService.getHomeTools()
			.then(function(modules){
				/*
				* If there is only one tool, then we can go directly to that tool if the settings
				* indicate that we may
				*/
				if(modules.length === 1 && modules[0].tools.length === 1 && settings.singleToolMenu === false){
					history.pushState(null, 'Home', '#/home'); // Fake coming from home
					$location.path(`/tool/${modules[0].tools[0].key}/${modules[0].id}`);
				}
				else{
					$location.path('/home');
				}
			});
		},
		funcGetProgressPromise = function(progress){
			if(UserService.PROGRESS_COMPLETED === progress){
				// If the user is registered we will start the background sync
				SyncService.startBackgroundSync();

				// We don't need to wait for this to complete, it must just happen
				PushService.registerDevice();

				// Check if there are new modules for the user
				ModuleService.hasNewModules().then((hasNewModules) => {
					if(hasNewModules){
						history.pushState(null, 'Home', '#/home'); // Fake coming from home
						$location.path('/register-selectModules');
						return $q.when(true);
					}
					else {
						// If not, check where "home" is going to be
						return funcGoHomePromise();
					}
				}, () => {
					// If we couldn't check online for new modules, we go back home
					return funcGoHomePromise();
				});


			}
			else if(UserService.PROGRESS_SELECT_MODULES === progress){
				$location.path('/register-selectModules');
			}
			else{
				$location.path('/register');
			}
		};

	funcGetSettings()
	.then(funcCheckNoMediaFile)
	.then(funcCheckRegistrationProgress)
	.then(funcGetProgressPromise, (reason) =>{
		navigator.splashscreen.hide();
		disableListener();
		return SynthErrorHandler(reason);
	});
};
BootCtrl.$inject = ['$q', '$rootScope', '$location', '$routeParams', '$timeout', 'DataService',
 'UserService', 'HomeService', 'SyncAPIService', 'SynthErrorHandler', 'SyncService',
 'PushService', 'UserSettings', 'ModuleService'];

export default BootCtrl;
