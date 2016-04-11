'use strict';

import ScheduleCtrl from './controllers/ScheduleCtrl';
import ScheduleService from './factories/ScheduleService';
import Config from './config';

import ScheduleLinkHandler from './handlers/ScheduleLinkHandler';

var ScheduleTool = 'synthesis.tools.schedule',
	controllers = 'synthesis.tools.schedule.controllers',
	factories = 'synthesis.tools.schedule.factories',
	handlers = 'synthesis.tools.schedule.handlers';

angular.module(controllers, [])
	.controller('ScheduleCtrl', ScheduleCtrl);

angular.module(factories, [])
	.factory('ScheduleService', ScheduleService);

angular.module(handlers, [])
	.factory('ScheduleLinkHandler', ScheduleLinkHandler);


angular.module(ScheduleTool, [
	controllers,
	factories,
	handlers
]).config(Config);

export default ScheduleTool;
