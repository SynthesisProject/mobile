'use strict';

/**
 * Directive to collapse a module
 */
class ModuleCollapse {

	constructor($rootScope){
		this.$rootScope = $rootScope;

		this.restrict = 'A';
		this.scope = false;
	}

	link(scope, element){

		var collapseButton = $(element.find('a')[0]), toCollapse = $(element.find('.collapse')[0]);


		/**
		* Refresh the scrolle before and after modules has been collapsed
		*/
		function refreshScoller(){
			this.$rootScope.$broadcast('iScrollRefresh', {'scollerId' : 'mainScroll'});
		}

		toCollapse.on('shown.bs.collapse', refreshScoller);
		toCollapse.on('hidden.bs.collapse', refreshScoller);

		/**
		* Toggles the collapse of a module at the specified index
		*/
		collapseButton.on('click', function(){
			toCollapse.collapse('toggle');
		});
	}
}

/**
 * Factory to create a new instance of the directive
 */
var ModuleCollapseFactory = function() {
	return new ModuleCollapse(...arguments);
};
ModuleCollapseFactory.$inject = ['$rootScope'];
export default ModuleCollapseFactory;
