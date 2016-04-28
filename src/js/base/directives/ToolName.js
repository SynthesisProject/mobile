'use strict';

class ToolName {

	constructor(moduleService){
		this.moduleService = moduleService;
		this.restrict = 'A';
		this.scope = {
			'moduleId' : '=',
			'toolName' : '='
		};
	}

	link(scope, element, attrs){
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
