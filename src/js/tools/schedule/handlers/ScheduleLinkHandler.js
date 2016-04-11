'use strict';

var ScheduleLinkHandler = ($q, SynthQLoop, SynthLinkHandler) => {
	return (toolContent) => {

		// If there is not data to look at
		if(toolContent == null || Object.keys(toolContent).length === 0){
			return $q.when(toolContent);
		}

		var idx = 0;
		var sheduleKeys = Object.keys(toolContent);

		function fixNextAnnoucement(){
			let currentIndex = idx++;
			if(currentIndex < sheduleKeys.length){
				let schedule = toolContent[sheduleKeys[currentIndex]];
				return SynthLinkHandler.fixContent(schedule.description).then((fixedContent)=>{
					schedule.body = fixedContent;
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
ScheduleLinkHandler.$inject = ['$q', 'SynthQLoop', 'SynthLinkHandler'];
export default ScheduleLinkHandler;
