'use strict';
var toolName = (ModuleService) => {
	return {
		'restrict' : 'A',
		'scope' : {
			'moduleId' : '=',
			'toolName' : '='
		},
		'link' : function (scope, element, attrs){
			if(!angular.isDefined(attrs.moduleId)){
				throw '"moduleId" should be an attribute of this directive.';
			}

			function update(){
				if(scope.moduleId == null || scope.toolName == null){
					element.text('');
				}
				else{
					ModuleService.getToolName(scope.moduleId, scope.toolName).then(function(name){
						element.text(name ? name : 'unknown');
					});
				}
			}

			scope.$watch('moduleName', update);
			scope.$watch('toolName', update);
		}
	};
};
toolName.$inject = ['ModuleService'];
export default toolName;
