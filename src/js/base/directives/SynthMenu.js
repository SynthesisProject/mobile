'use strict';

class SynthMenu {

	/**
	 * Creates a new instance of the SynthMenu directive
	 */
	constructor($location, userService){
		/**
		 * Directive restricted to Element.
		 */
		this.restrict = 'E';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = false;

		/**
		 * URL of template to use.
		 */
		this.templateUrl = 'base/partials/directives/menu.html';

		/**
		 * A reference to $location.
		 */
		this.$location = $location;

		/**
		 * A reference to UserService.
		 */
		this.userService = userService;
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
	linkDirective(scope){
		const $location = this.$location,
			self = this;
		scope.menuOpen = false;
		scope.isRegistered = false;

		scope.toggleMenu = () => {
			scope.menuOpen = !scope.menuOpen;
		};
		scope.openLink = (link) => {
			scope.menuOpen = false;
			$location.path(link);
		};

		function updateCompleteFlag(){
			self.userService.isRegistrationComplete().then((iscomplete) => {
				scope.isRegistered = iscomplete;
			});
		}
		updateCompleteFlag();

		scope.$on('registrationDataChanged', () => {
			updateCompleteFlag();
		});


		// Open sync page if user is registered
		scope.openSync = () => {
			// Make sure the close the menu that could maybe be open
			scope.menuOpen = false;

			if(scope.isRegistered){
				$location.path('/sync');
			}
		};

	}
}

/**
 * Factory to create new instances of the SynthMenu directive
 */
var SynthMenuFactory = function() {
	return new SynthMenu(...arguments);
};
SynthMenuFactory.$inject = ['$location', 'UserService'];
export default SynthMenuFactory;
