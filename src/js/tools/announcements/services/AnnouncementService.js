'use strict';
/**
* Create factory for the announcement Service
*/
class AnnouncementService{

	constructor(moduleService){
		this.moduleService = moduleService;
	}

	/**
	* Gets all the announcements
	*/
	getAnnouncements(moduleId) {
		return this.moduleService.getToolData(moduleId, 'announcements');
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

var AnnouncementServiceFactory = function(){
	return new AnnouncementService(...arguments);
};
AnnouncementServiceFactory.$inject = ['ModuleService'];
export default AnnouncementServiceFactory;
