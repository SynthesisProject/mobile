'use strict';

/**
* Directive that will display the module name from the module code if available
*/
class ModuleName{

	constructor(moduleService){
		this.moduleService = moduleService;
		this.restrict = 'A';
		this.scope = {
			'moduleName' : '='
		};
	}

	link(scope, element){
		scope.$watch('moduleName', function(moduleId){
			if(moduleId == null){
				element.text('');
			}
			else{
				this.moduleService.getModuleName(moduleId).then(function(name){
					element.text(name ? name : 'unknown');
				});
			}
		});

	}
}

/**
 * Factory to create a new instance of the directive
 */
var ModuleNameFactory = function() {
	return new ModuleName(...arguments);
};
ModuleNameFactory.$inject = ['ModuleService'];
export default ModuleNameFactory;
