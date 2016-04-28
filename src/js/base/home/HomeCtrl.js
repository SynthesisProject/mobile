/**
 * Controller for the home screen
 */
class HomeCtrl{

	constructor(HomeService, $scope, $rootScope, SynthErrorHandler){
		$rootScope.activePage = 'home';
		$rootScope.breadcrumbs = null;
		$scope.searchText = '';

		// Add the tools to the UI
		HomeService
			.getHomeTools()
			.then(
			// Success
			function(modules){
				$scope.modules = modules;
			},
			// Failed
			SynthErrorHandler
		);
	}


}
HomeCtrl.$inject = ['HomeService', '$scope', '$rootScope', 'SynthErrorHandler'];
export default HomeCtrl;
