'use strict';
var moduleCollapse = ($rootScope) => {
	return {
		'restrict' : 'A',
		'scope' : false,
		/*'replace' : true,*/
		'link' : function (scope, element){

			var collapseButton = $(element.find('a')[0]), toCollapse = $(element.find('.collapse')[0]);


			/**
			* Refresh the scrolle before and after modules has been collapsed
			*/
			function refreshScoller(){
				$rootScope.$broadcast('iScrollRefresh', {'scollerId' : 'mainScroll'});
			}

			toCollapse.on('shown.bs.collapse', refreshScoller);
			toCollapse.on('hidden.bs.collapse', refreshScoller);

			/**
			* Toggles the collapse of a module at the specified index
			*/
			collapseButton.on('click', function(){
				toCollapse.collapse('toggle');
			});
		}
	};
};
moduleCollapse.$inject = ['$rootScope'];
export default moduleCollapse;
