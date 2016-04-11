'use strict';
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
