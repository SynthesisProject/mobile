'use strict';
var AnnouncementsLinkHandler = ($q, $timeout, SynthLinkHandler, SynthQLoop) => {

	return (toolContent) => {

		// If there is not data to look at
		if(toolContent == null || Object.keys(toolContent).length === 0){
			return $q.when(toolContent);
		}

		var idx = 0;
		var announcementKeys = Object.keys(toolContent);

		function fixNextAnnoucement(){
			let currentIndex = idx++;
			if(currentIndex < announcementKeys.length){
				let announcement = toolContent[announcementKeys[currentIndex]];
				return SynthLinkHandler.fixContent(announcement.body).then((fixedContent)=>{
					announcement.body = fixedContent;
				});

			}

			// Nothing more to loop, so lets return a null to stop the SynthQLoop
			return null;
		}

		return SynthQLoop(fixNextAnnoucement)
			.then(()=>{
				return toolContent;
			});
	};
};
AnnouncementsLinkHandler.$inject = ['$q', '$timeout', 'SynthLinkHandler', 'SynthQLoop'];
export default AnnouncementsLinkHandler;
