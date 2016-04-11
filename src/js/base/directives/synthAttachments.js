'use strict';
/**
* Directive to display a button with a list of attachments
*/
var synthAttachments = ($filter) => {
	return {
		'restrict' : 'E',
		'templateUrl' : 'base/partials/directives/attachments.html',
		'scope' : {
			'attachments' : '='
		},
		/*'replace' : true,*/
		'link' : function (scope, element, attr){


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
			scope.attachments = $filter('attachments')(scope.attachments);

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
	};
};
synthAttachments.$inject = ['$filter'];
export default synthAttachments;
