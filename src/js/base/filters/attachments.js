'use strict';
/**
 * Filter to get all the attachments from an array
 */
var attachments = () => {
	return function(attachmentsArray) {
		var out = [];
		for(var aId in attachmentsArray){
			var attachment = attachmentsArray[aId];
			if (attachment.link === false){
				out.push(attachment);
			}
		}
		return out;
	};
};
export default attachments;
