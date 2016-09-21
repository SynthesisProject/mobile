'use strict';

import ResourcesCtrl from './controllers/ResourcesCtrl';

import ResourcesService from './factories/ResourcesService';

import resourceImg from './directives/resourceImg';
import resourceListItem from './directives/resourceListItem';

import Config from './config';

import ResourcesDeleteHandler from './handlers/ResourcesDeleteHandler';

var ResourcesTool = 'synthesis.tools.resources',
	controllers = 'synthesis.tools.resources.controllers',
	factories = 'synthesis.tools.resources.factories',
	directives = 'synthesis.tools.resources.directives',
	handlers = 'synthesis.tools.resources.handlers';


angular.module(controllers, [])
	.controller('ResourcesCtrl', ResourcesCtrl);

angular.module(factories, [])
	.factory('ResourcesService', ResourcesService);

angular.module(directives, [])
	.directive('resourceImg', resourceImg)
	.directive('resourceListItem', resourceListItem);

angular.module(handlers, [])
	.factory('ResourcesDeleteHandler', ResourcesDeleteHandler);

angular.module(ResourcesTool, [
	controllers,
	factories,
	directives,
	handlers
]).config(Config);

export default ResourcesTool;
