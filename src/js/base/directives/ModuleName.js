'use strict';

/**
* Directive that will display the module name from the module code if available
*/
class ModuleName{

	/**
	 * Creates a new instance of the ModuleName directive
	 */
	constructor(moduleService){
		/**
		 * A reference to ModuleService.
		 */
		this.moduleService = moduleService;

		/**
		 * Directive restricted to Attribute.
		 */
		this.restrict = 'A';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = {
			'moduleName' : '='
		};

		const self = this;
		/**
		 * Linking function.
		 */
		this.link = function(){
			self.linkDirective(...arguments);
		};
	}

	/**
	 * Link function for the directive
	 */
	linkDirective(scope, element){
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
