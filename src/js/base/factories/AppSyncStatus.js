'use strict';
/**
* Factory that contains the application's sync status.
* This object is ONLY entended to be used to indicate if the application
* is in sync. DO NOT use this object as a pass-through object between sync controllers/services
*/
class AppSyncStatus {
	constructor() {
		// Flag if the app is overall in sync
		this.inSync = false;
		// Array of tools which each will have an inSync flag
		this.tools = {};
	}

	// Function to mark all as out of sync
	allOutSync(){
		this.inSync = false;
		this.tools = {};
	}

	/*
	* Function to update the sync status of a tool
	* If no tool is specified, it will update the overall status
	*/
	update(inSync, tool){
		if (tool == null){
			this.inSync = false;
		}
		else{
			this.tools = this.tools || {};
			this.tools[tool] = this.tools[tool] || {};
			this.tools[tool].inSync = inSync;
		}
	}

	// Function to update the sync status of all the tools
	updateTools(tools){
		if(tools == null){
			this.tools = {};
		}
		else{
			this.tools = tools;
		}
	}
}

/**
 * Factory function to create the Object
 */
export default function AppSyncStatusFactory(){
	return new AppSyncStatus();
}
