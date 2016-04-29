'use strict';
/**
 * Directive to show the sync status of a tool
 */
class ToolSyncStatus{

	/**
	 * Creates a new instance of the ToolSyncStatus directive
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
		var tool = scope.tool;
		const self = this;

		function updateToolSyncIndicator(){
			self.syncAPIService.getSyncStatusToolOffline(tool.moduleId, tool.key).then((syncStatus) => {
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
}

/**
 * Factory to create new instances of the ToolSyncStatus directive
 */
var ToolSyncStatusFactory = function(){
	return new ToolSyncStatus(...arguments);
};
ToolSyncStatusFactory.$inject = ['SyncAPIService'];
export default ToolSyncStatusFactory;
