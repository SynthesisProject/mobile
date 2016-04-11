'use strict';
/**
* Create factory for the announcement Service
*/
var AnnouncementService = (ModuleService) => {

	class AnnouncementServiceImpl{

		/**
		* Gets all the announcements
		*/
		getAnnouncements(moduleId) {
			return ModuleService.getToolData(moduleId, 'announcements');
		}

		/**
		* Gets an announcement for the specified ID
		*/
		getAnnouncement(moduleId, announcementId) {
			return this.getAnnouncements(moduleId)
			.then((announcements) => {
				return announcements[announcementId];
			});
		}

	}

	return new AnnouncementServiceImpl();
};
AnnouncementService.$inject = ['ModuleService'];
export default AnnouncementService;
