'use strict';
/**
* Directive to create the footer for the application
*/
class SynthFooter{

	/**
	 * Creates a new instance of the SynthFooter directive
	 */
	constructor(){
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
		this.templateUrl = 'base/partials/directives/footer.html';
	}
}

/**
 * Factory to create new instances of the SynthFooter directive.
 */
var SynthFooterFactory = () => {
	return new SynthFooter();
};

export default SynthFooterFactory;
