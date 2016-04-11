'use strict';
var Config = ($routeProvider, SynthDeleteHandlerProvider) => {

	SynthDeleteHandlerProvider.addHandler('resources', 'ResourcesDeleteHandler');

	$routeProvider
		.when('/tool/resources/:moduleId/', {templateUrl : 'tools/resources/partials/resources.html'});
};
Config.$inject = ['$routeProvider', 'SynthDeleteHandlerProvider'];
export default Config;
