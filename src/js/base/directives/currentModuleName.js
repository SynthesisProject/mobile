'use strict';

/**
* Directive that will display the module name from the module code if available
*/
var currentModuleName = ($rootScope, $route, RegistrationService) => {
	return {
		'restrict' : 'A',
		'scope' : {
			'moduleName' : '='
		},
		'link' : function (scope, element){

			$rootScope.$on('$locationChangeSuccess', function(){
				console.log(JSON.stringify($route.current.params));
				var newModuleId = $route.current.params ? $route.current.params.moduleId : null;

				// If there is no new value, we blank
				if(newModuleId == null || newModuleId == ''){
					element.text('');
				}
				// Else we need to lookup the new value
				else{
					RegistrationService.getRegistration().then(function(registrationData){
						var moduleName = '';
						if(registrationData && registrationData.modules && registrationData.modules[newModuleId]){
							moduleName = registrationData.modules[newModuleId].name;
						}
						element.text(moduleName);
					});
				}
			});
		}
	};
};
currentModuleName.$inject = ['$rootScope', '$route', 'RegistrationService'];
export default currentModuleName;
