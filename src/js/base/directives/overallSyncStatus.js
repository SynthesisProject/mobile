'use strict';
var overallSyncStatus = (SyncAPIService) => {
	return {
		'restrict' : 'C',
		'scope' : {
			'tool' : '='
		},
		'link' : function (scope, element){
			var cloudElement = $(element.find('.glyphicon')[0]);

			function updateSyncIndicator(sync){

				/**
				* If there is no sync status, or if no sync action or state exists, we
				* have to perform a sync check our self to find out what the status is
				*/
				if(sync == null || (sync.state == null && sync.action == null)){
					SyncAPIService.getSyncStatusModulesOffline().then(function(syncStatus){
						updateSyncIndicator({'action' : null, 'state' : (syncStatus.inSync ? 'inSync' : 'outSync')});
					});
				}
				/**
				* If there is a sync action, we use that first
				*/
				else if(sync.action != null && sync.action !== 'none'){
					cloudElement.addClass('syncBusy');
					cloudElement.removeClass('glyphicon-cloud');
					cloudElement.removeClass('inSync');
					cloudElement.addClass('outSync');
					if(sync.action === 'downloading'){
						cloudElement.addClass('glyphicon-cloud-download');
						cloudElement.removeClass('glyphicon-cloud-upload');

					}
					else if(sync.action === 'uploading'){
						cloudElement.removeClass('glyphicon-cloud-download');
						cloudElement.addClass('glyphicon-cloud-upload');
					}
				}
				// We are only working with the state
				else{
					cloudElement.removeClass('glyphicon-cloud-download');
					cloudElement.removeClass('glyphicon-cloud-upload');
					cloudElement.removeClass('syncBusy');
					cloudElement.addClass('glyphicon-cloud');
					if(sync.state === 'inSync'){
						cloudElement.addClass('inSync');
						cloudElement.removeClass('outSync');
					}
					else if(sync.state === 'outSync'){
						cloudElement.removeClass('inSync');
						cloudElement.addClass('outSync');
					}
				}
			}

			updateSyncIndicator(null);

			// Listen for sync state broadcasts
			scope.$on('syncStatusChanged', function(event, state){
				updateSyncIndicator(state);
			});

		}
	};
};
overallSyncStatus.$inject = ['SyncAPIService'];
export default overallSyncStatus;
