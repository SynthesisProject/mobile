'use strict';
/**
* Announcement Detail controller
*/
var AnnouncementDetailCtrl = ($scope, $rootScope, $routeParams, AnnouncementService, SynthErrorHandler) => {
	$rootScope.activePage = 'announcements';
	$rootScope.breadcrumbs = [{'name' : 'Announcements', 'url' : `#/tool/announcements/${$routeParams.moduleId}`}];

	// Get the specific announcement
	AnnouncementService
		.getAnnouncement($routeParams.moduleId, $routeParams.announcementId)
		.then((announcement) => {
			$scope.announcement = announcement;
			$rootScope.breadcrumbs = [{'name' : 'Announcements', 'url' : `#/tool/announcements/${$routeParams.moduleId}`}, {'name' : 'Announcement'}];
		}, SynthErrorHandler);
};
AnnouncementDetailCtrl.$inject = ['$scope', '$rootScope', '$routeParams', 'AnnouncementService', 'SynthErrorHandler'];
export default AnnouncementDetailCtrl;
