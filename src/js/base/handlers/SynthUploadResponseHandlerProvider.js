'use strict';


/**
* Handlers for responses to uploads.
* Some tools will have to fix ids for generated content to ids
* returned by the server.
*
* The handler will be called with the following parameters
* $1 - sentObject		- The original data String
* $2 - responseObject	- The response from the server after the upload
*
* The handler should return a string or object representing the
* fixed data.
*
* Example
* function myUploadHandler(sentObject, responseObject){
* 		var string = JSON.stringify(sentObject);
*		// Replace Ids
*		for(var oldKey in responseObject){
*			var newKey = responseObject[oldKey];
*			var regEx = new RegExp(oldKey, 'g');
*			// Replace all instances of the old key with the new key
*			string = string.replace(regEx, newKey);
*		}
*		return string;
* }
*
*/
var SynthAttachmentMinerProvider = function(){

	// Map of registered handlers
	var handlersMap = {};

	/**
	 * Adds a handler to the list map of attachments miners
	 * @param toolName Name of the tool this handler is for.
	 * @param funcHandler Handler function to use.
	 */
	this.addHandler = (toolName, handlerName) =>{
		if (handlersMap[toolName] == null){
			handlersMap[toolName] = handlerName;
		}
	};


	this.$get = ['$injector', function($injector){
		return {
			getHandler : function(toolName){
				var handlerName = handlersMap[toolName];
				if(handlerName == null){
					return null;
				}
				return $injector.get(handlerName);
			},
			hasHandlers : function(){
				return Object.keys(handlersMap).length > 0;
			}
		};
	}];
};

export default SynthAttachmentMinerProvider;
