'use strict';

import AnnouncementListCtrl from './controllers/AnnouncementListCtrl';
import AnnouncementDetailCtrl from './controllers/AnnouncementDetailCtrl';

import AnnouncementService from './services/AnnouncementService';

import Config from './config';

// Import handlers
import AnnouncementsImageHandler from './handlers/AnnouncementsImageHandler';
import AnnouncementsDeleteHandler from './handlers/AnnouncementsDeleteHandler';
import AnnouncementsLinkHandler from './handlers/AnnouncementsLinkHandler';

var AnnouncementsTool = 'synthesis.tools.announcements',
	controllers = 'synthesis.tools.announcements.controllers',
	factories = 'synthesis.tools.announcements.factories',
	handlers = 'synthesis.tools.announcements.handlers';

angular.module(controllers, [])
	.controller('AnnouncementListCtrl', AnnouncementListCtrl)
	.controller('AnnouncementDetailCtrl', AnnouncementDetailCtrl);

angular.module(factories, [])
	.factory('AnnouncementService', AnnouncementService);

angular.module(handlers, [])
	.factory('AnnouncementsImageHandler', AnnouncementsImageHandler)
	.factory('AnnouncementsDeleteHandler', AnnouncementsDeleteHandler)
	.factory('AnnouncementsLinkHandler', AnnouncementsLinkHandler);

angular.module(AnnouncementsTool, [
	controllers,
	factories,
	handlers
]).config(Config);

export default AnnouncementsTool;
