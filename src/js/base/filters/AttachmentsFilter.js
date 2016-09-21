'use strict';
/**
* Filter to get all the attachments from an array
*/
var AttachmentsFilter = function(attachmentsArray) {
	var out = [];
	for(var aId in attachmentsArray){
		var attachment = attachmentsArray[aId];
		if (attachment.link === false){
			out.push(attachment);
		}
	}
	return out;
};

/**
* Factory to create new instances of the AttachmentsFilter
*/
export default function AttachmentsFilterFactory(){
	return AttachmentsFilter;
}
