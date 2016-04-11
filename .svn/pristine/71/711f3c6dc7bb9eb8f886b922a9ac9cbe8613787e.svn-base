'use strict';

/**
* Directive that will display the module name from the module code if available
*/
var moduleName = (ModuleService) => {
	return {
		'restrict' : 'A',
		'scope' : {
			'moduleName' : '='
		},
		'link' : function (scope, element){

			scope.$watch('moduleName', function(moduleId){
				if(moduleId == null){
					element.text('');
				}
				else{
					ModuleService.getModuleName(moduleId).then(function(name){
						element.text(name ? name : 'unknown');
					});
				}
			});

		}
	};
};
moduleName.$inject = ['ModuleService'];
export default moduleName;
