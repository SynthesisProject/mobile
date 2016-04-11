'use strict';
/**
* Announcement list controller
*/
var AnnouncementListCtrl = ($scope, $rootScope, $routeParams, $filter, AnnouncementService, SynthErrorHandler) => {
	$rootScope.activePage = 'announcements';
	$rootScope.breadcrumbs = [{'name' : 'Announcements'}];

	// Add default values to scope
	angular.extend($scope, {
		// The id of the module we are working with
		moduleId : $routeParams.moduleId,

		// Flag if we are busy loading
		loadingAnnouncements : true,

		// List of Announcements to display
		announcements : [],

		// Get function used for sorting events by date
		orderDateFunc : function(announcement){
			return moment(announcement.mod_date).valueOf();
		}
	});

	// Put all announcements on UI
	AnnouncementService.getAnnouncements($routeParams.moduleId)
		.then((announcements) => {
			$scope.announcements = $filter('object2Array')(announcements);
			$scope.loadingAnnouncements = false;
		}, (reason) => {
			$scope.loadingAnnouncements = false;
			return SynthErrorHandler(reason);
		});
};
AnnouncementListCtrl.$inject = ['$scope', '$rootScope', '$routeParams', '$filter', 'AnnouncementService', 'SynthErrorHandler'];
export default AnnouncementListCtrl;
