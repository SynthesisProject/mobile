'use strict';
/**
* Directive to display a button with a list of attachments
*/
class SynthAttachments{

	/**
	 * Creates a new instance of the SynthAttachments directive
	 */
	constructor($filter){

		/**
		 * Directive restricted to Element.
		 */
		this.restrict = 'E';

		/**
		 * URL of template to use.
		 */
		this.templateUrl = 'base/partials/directives/attachments.html';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = {
			'attachments' : '='
		};

		/**
		 * A reference to $filter.
		 */
		this.$filter = $filter;

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
	linkDirective(scope, element, attr){
		// Open an attachment natively on the device
		scope.openAttachment = function(attachment){

			window.plugins.FileOpener.open(attachment.downloadPath,
				function(){

				},
				function(){
					//alert(error);
				});
		};

		// The attachments we need to handle
		scope.attachments = this.$filter('attachments')(scope.attachments);

		// If the button needs to be pulled in a direction
		if (attr.pull){
			if (attr.pull === 'right'){
				scope.buttonPull = 'pull-right';
			}
			else if (attr.pull === 'left'){
				scope.buttonPull = 'pull-left';
			}
			else{
				scope.buttonPull = null;
			}
		}
		else{
			scope.buttonPull = null;
		}
	}
}

/**
 * Factory to create new instances of the SynthAttachments directive.
 */
var SynthAttachmentsFactory = function(){
	return new SynthAttachments(...arguments);
};
SynthAttachmentsFactory.$inject = ['$filter'];
export default SynthAttachmentsFactory;
