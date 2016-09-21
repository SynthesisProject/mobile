'use strict';

/**
 * Directive to collapse a module
 */
class ModuleCollapse {

	/**
	 * Creates a new instance of the ModuleCollapse directive
	 */
	constructor($rootScope){
		/**
		 * A reference to $rootScope.
		 */
		this.$rootScope = $rootScope;

		/**
		 * Directive restricted to Attribute.
		 */
		this.restrict = 'A';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = false;
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
