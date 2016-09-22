'use strict';

var AnnouncementsImageHandler = ($q, SynthEmbeddedImageHandler) => {

	return (toolContent) => {
		var announcementKeys = Object.keys(toolContent);

		/**
		 * If there is no annoucment content, there is nothing to
		 * attempt to change
		 */
		if(announcementKeys.length === 0){
			return $q.when(toolContent);
		}

		let promise = $q.when();
		angular.forEach(announcementKeys, function(announcementKey){
			promise = promise.then(function(){
				let announcement = toolContent[announcementKey];
				return SynthEmbeddedImageHandler.fixForHtmlElement(announcement.body, function(imagePath){
					return SynthEmbeddedImageHandler.resolveImageLocalPathFromAttachments(imagePath, announcement.attachments || []);
				})
				.then((fixedContent) =>{
					// Update the content to the newly fixed html content
					toolContent[announcementKey].body = fixedContent;
				});
			});
		});
		return promise.then(()=>{
			return toolContent;
		});
	};

};
AnnouncementsImageHandler.$inject = ['$q', 'SynthEmbeddedImageHandler'];

export default AnnouncementsImageHandler;
