'use strict';
/**
* Factory that contains the application's sync status.
* This object is ONLY entended to be used to indicate if the application
* is in sync. DO NOT use this object as a pass-through object between sync controllers/services
*/
var AppSyncStatus = () => {
	return {
		// Flag if the app is overall in sync
		'inSync' : false,

		// Array of tools which each will have an inSync flag
		'tools' : {},

		// Function to mark all as out of sync
		'allOutSync' : function(){
			this.inSync = false;
			this.tools = {};
		},

		/*
		* Function to update the sync status of a tool
		* If no tool is specified, it will update the overall status
		*/
		'update' : function(inSync, tool){
			if (tool == null){
				this.inSync = false;
			}
			else{
				this.tools = this.tools || {};
				this.tools[tool] = this.tools[tool] || {};
				this.tools[tool].inSync = inSync;
			}
		},

		// Function to update the sync status of all the tools
		'updateTools' : function(tools){
			if(tools == null){
				this.tools = {};
			}
			else{
				this.tools = tools;
			}
		}
	};
};
AppSyncStatus.$inject = [];
export default AppSyncStatus;
