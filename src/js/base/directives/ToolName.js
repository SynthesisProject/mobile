'use strict';

class ToolName {

	/**
	 * Creates a new instance of the ToolName directive
	 */
	constructor(moduleService){
		/**
		 * Directive restricted to Attribute.
		 */
		this.restrict = 'A';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = {
			'moduleId' : '=',
			'toolName' : '='
		};
		const self = this;

		/**
		 * Linking function.
		 */
		this.link = function(){
			self.linkDirective(...arguments);
		};

		/**
		 * A reference to ModuleService.
		 */
		this.moduleService = moduleService;
	}

	/**
	 * Link function for the directive
	 */
	linkDirective(scope, element, attrs){
		if(!angular.isDefined(attrs.moduleId)){
			throw '"moduleId" should be an attribute of this directive.';
		}

		function update(){
			if(scope.moduleId == null || scope.toolName == null){
				element.text('');
			}
			else{
				this.moduleService.getToolName(scope.moduleId, scope.toolName).then(function(name){
					element.text(name ? name : 'unknown');
				});
			}
		}

		scope.$watch('moduleName', update);
		scope.$watch('toolName', update);
	}
}
/**
 * Factory to create a new instance of the directive
 */
var ToolNameFactory = function(){
	return new ToolName(...arguments);
};
ToolNameFactory.$inject = ['ModuleService'];
export default ToolNameFactory;
