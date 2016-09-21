'use strict';

/**
* Directive that will display the module name from the module code if available
*/
class CurrentModuleName {

	/**
	 * Creates a new instance of the CurrentModuleName directive
	 */
	constructor($rootScope, $route, registrationService){
		/**
		 * A reference to $rootScope.
		 */
		this.$rootScope = $rootScope;

		/**
		 * A reference to $route.
		 */
		this.$route = $route;

		/**
		 * A reference to RegistrationService.
		 */
		this.registrationService = registrationService;

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
		this.$rootScope.$on('$locationChangeSuccess', () => {
			var newModuleId = this.$route.current.params ? this.$route.current.params.moduleId : null;

			// If there is no new value, we blank
			if(newModuleId == null || newModuleId == ''){
				element.text('');
			}
			// Else we need to lookup the new value
			else{
				this.registrationService.getRegistration().then((registrationData) => {
					var moduleName = '';
					if(registrationData && registrationData.modules && registrationData.modules[newModuleId]){
						moduleName = registrationData.modules[newModuleId].name;
					}
					element.text(moduleName);
				});
			}
		});
	}
}

/**
 * Factory to create a new instance of the directive
 */
var CurrentModuleNameFactory = function() {
	return new CurrentModuleName(...arguments);
};
CurrentModuleNameFactory.$inject = ['$rootScope', '$route', 'RegistrationService'];
export default CurrentModuleNameFactory;
