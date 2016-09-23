document.addEventListener('deviceready', function(){
	function continueBoot(){
		navigator.splashscreen.show();
		window.location = 'synthesis.html';
	}

	// Only android requires addition file access permissions
	if(device.platform !== 'Android'){
		continueBoot();
		return;
	}
	var permissions = cordova.plugins.permissions;
	function checkPermissions(){

		function errorHandler(){
			console.log('Failed to get File Access permission');
			navigator.app.exitApp();
		}
		permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, function(status){
			if(status.hasPermission){
				continueBoot();
			}
			else{
				permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, function(requestStatus){
					if(requestStatus.hasPermission){
						continueBoot();
					}
					else{
						console.log('User did not allow file access');
						navigator.notification.confirm(
								'This application requires file access to store offline files.',
								function(index){
									if (index === 2){
										navigator.app.exitApp();
									}
									else{
										checkPermissions();
									}
								},
								'File Permission Required',
								['Retry', 'Exit']);
					}
				}, errorHandler);
			}
		}, errorHandler);
	}

	checkPermissions();
}, false);
