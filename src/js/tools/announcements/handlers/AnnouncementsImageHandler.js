'use strict';

var AnnouncementsImageHandler = ($q, $timeout, SynthEmbeddedImageHandler, SynthQLoop) => {

	return (toolContent) => {
		var idx = 0;
		var announcementKeys = Object.keys(toolContent);

		/**
		 * If there is no annoucment content, there is nothing to
		 * attempt to change
		 */
		if(announcementKeys.length === 0){
			return $q.when(toolContent);
		}


		function fixNextAnnoucement(){
			let currentIndex = idx++;
			if(currentIndex < announcementKeys.length){
				let announcement = toolContent[announcementKeys[currentIndex]];
				return SynthEmbeddedImageHandler.fixForHtmlElement(announcement.body, function(imagePath){
					return SynthEmbeddedImageHandler.resolveImageLocalPathFromAttachments(imagePath, announcement.attachments || []);
				})
				.then((fixedContent) =>{
					// Update the content to the newly fixed html content
					toolContent[announcementKeys[currentIndex]].body = fixedContent;
				});

			}

			// Nothing more to loop, so lets return a null to stop the SynthQLoop
			return null;
		}

		// Start looping over each announcement
		return SynthQLoop(fixNextAnnoucement)
			.then(()=>{
				return toolContent;
			});
	};

};
AnnouncementsImageHandler.$inject = ['$q', '$timeout', 'SynthEmbeddedImageHandler', 'SynthQLoop'];

export default AnnouncementsImageHandler;
