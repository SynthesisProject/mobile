'use strict';
var AnnouncementsLinkHandler = ($q, SynthLinkHandler) => {

	return (toolContent) => {

		// If there is not data to look at
		if(toolContent == null || Object.keys(toolContent).length === 0){
			return $q.when(toolContent);
		}
		var announcementKeys = Object.keys(toolContent);
		let promise = $q.when();
		angular.forEach(announcementKeys, function(annoucementKey){
			promise = promise.then(function(){
				let announcement = toolContent[annoucementKey];
				return SynthLinkHandler.fixContent(announcement.body).then((fixedContent)=>{
					announcement.body = fixedContent;
				});
			});
		});

		return promise.then(()=>{
			return toolContent;
		});
	};
};
AnnouncementsLinkHandler.$inject = ['$q', 'SynthLinkHandler'];
export default AnnouncementsLinkHandler;
