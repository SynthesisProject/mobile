'use strict';
var Config = ($routeProvider, SynthLinkHandlerProvider, SynthAttachmentMinerProvider) => {

	SynthLinkHandlerProvider.addHandler('schedule', 'ScheduleLinkHandler');
	SynthAttachmentMinerProvider.addHandler('schedule', 'default');

	$routeProvider
		.when('/tool/schedule/:moduleId', {templateUrl : 'tools/schedule/partials/schedule.html'});
};
Config.$inject = ['$routeProvider', 'SynthLinkHandlerProvider', 'SynthAttachmentMinerProvider'];
export default Config;
