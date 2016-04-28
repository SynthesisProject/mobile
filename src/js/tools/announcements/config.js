'use strict';

/**
* Configure routes for announcements
*/
var Config = ($routeProvider, SynthAttachmentMinerProvider, SynthEmbeddedImageHandlerProvider, SynthDeleteHandlerProvider, SynthLinkHandlerProvider) => {

	SynthAttachmentMinerProvider.addHandler('announcements', 'default');
	SynthEmbeddedImageHandlerProvider.addHandler('announcements', 'AnnouncementsImageHandler');
	SynthDeleteHandlerProvider.addHandler('announcements', 'AnnouncementsDeleteHandler');
	SynthLinkHandlerProvider.addHandler('announcements', 'AnnouncementsLinkHandler');

	$routeProvider
		.when('/tool/announcements/:moduleId', {templateUrl : 'tools/announcements/partials/announcements-list.html'})
		.when('/tool/announcements/:moduleId/:announcementId', {templateUrl : 'tools/announcements/partials/announcements-detail.html'});
};
Config.$inject = ['$routeProvider', 'SynthAttachmentMinerProvider', 'SynthEmbeddedImageHandlerProvider', 'SynthDeleteHandlerProvider', 'SynthLinkHandlerProvider'];
export default Config;
