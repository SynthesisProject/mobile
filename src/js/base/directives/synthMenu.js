'use strict';
var synthMenu = ($location, UserService) => {
	return {
		'restrict' : 'E',
		'scope' : false,
		'templateUrl' : 'base/partials/directives/menu.html',
		'link' : (scope) => {

			scope.menuOpen = false;
			scope.isRegistered = false;

			scope.toggleMenu = () => {
				scope.menuOpen = !scope.menuOpen;
			};
			scope.openLink = (link) => {
				scope.menuOpen = false;
				$location.path(link);
			};

			function updateCompleteFlag(){
				UserService.isRegistrationComplete().then((iscomplete) => {
					scope.isRegistered = iscomplete;
				});
			}
			updateCompleteFlag();

			scope.$on('registrationDataChanged', () => {
				updateCompleteFlag();
			});


			// Open sync page if user is registered
			scope.openSync = () => {
				// Make sure the close the menu that could maybe be open
				scope.menuOpen = false;

				if(scope.isRegistered){
					$location.path('/sync');
				}
			};

		}
	};
};
synthMenu.$inject = ['$location', 'UserService'];
export default synthMenu;
