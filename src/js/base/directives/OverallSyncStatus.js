'use strict';

class OverallSyncStatus{

	/**
	 * Creates a new instance of the OverallSyncStatus directive
	 */
	constructor(syncAPIService){
		/**
		 * A reference to SyncAPIService.
		 */
		this.syncAPIService = syncAPIService;

		/**
		 * Directive restricted to Class.
		 */
		this.restrict = 'C';

		/**
		 * Isolated scope for directive.
		 */
		this.scope = {
			'tool' : '='
		};
		const self = this;
		/**
		 * Linking function.
		 */
		this.link = function(){
			self.linkDirective(...arguments);
		};
	}

	/**
	 * Link function for the directive
	 */
	linkDirective(scope, element){
		var cloudElement = $(element.find('.glyphicon')[0]);
		var self = this;
		function updateSyncIndicator(sync){

			/**
			* If there is no sync status, or if no sync action or state exists, we
			* have to perform a sync check our self to find out what the status is
			*/
			if(sync == null || (sync.state == null && sync.action == null)){
				self.syncAPIService.getSyncStatusModulesOffline().then(function(syncStatus){
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
		scope.$on('syncStatusChanged', (event, state) => {
			updateSyncIndicator(state);
		});

	}
}

/**
 * Factory to create a new instance of the directive
 */
var OverallSyncStatusFactory = function(){
	return new OverallSyncStatus(...arguments);
};
OverallSyncStatusFactory.$inject = ['SyncAPIService'];
export default OverallSyncStatusFactory;
