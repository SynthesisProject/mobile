'use strict';

var ScheduleLinkHandler = ($q, SynthLinkHandler) => {
	return (toolContent) => {

		// If there is not data to look at
		if(toolContent == null || Object.keys(toolContent).length === 0){
			return $q.when(toolContent);
		}
		var sheduleKeys = Object.keys(toolContent);
		let promise = $q.when();
		angular.forEach(sheduleKeys, function(scheduleId){
			promise = promise.then(function(){
				let schedule = toolContent[scheduleId];
				return SynthLinkHandler.fixContent(schedule.description).then((fixedContent)=>{
					schedule.body = fixedContent;
				});
			});
		});
		return promise.then(function(){
			return toolContent;
		});
	};
};
ScheduleLinkHandler.$inject = ['$q', 'SynthLinkHandler'];
export default ScheduleLinkHandler;
