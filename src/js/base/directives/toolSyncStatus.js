'use strict';
var toolSyncStatus = (SyncAPIService) => {
	return {
		'restrict' : 'C',
		'scope' : {
			'tool' : '='
		},
		'link' : function (scope, element){
			var tool = scope.tool;

			function updateToolSyncIndicator(){
				SyncAPIService.getSyncStatusToolOffline(tool.moduleId, tool.key).then((syncStatus) => {
					if(syncStatus.inSync){
						element.addClass('inSync');
						element.removeClass('outSync');
					}
					else{
						element.removeClass('inSync');
						element.addClass('outSync');
					}
				});
			}
			updateToolSyncIndicator();

			scope.$on('syncStatusChanged', () => {
				updateToolSyncIndicator();
			});

		}
	};
};
toolSyncStatus.$inject = ['SyncAPIService'];
export default toolSyncStatus;
