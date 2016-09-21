'use strict';

/**
* Handlers to find content that needs to be deleted.
* The handler function will be called with the following parameters (dataDir
*/
var SynthDeleteHandlerProvider = function(){
	// Map of registered handler names
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
			// Get a handler
			getHandler : function(toolName){
				var handlerName = handlersMap[toolName];
				if(handlerName == null){
					return null;
				}
				return $injector.get(handlerName);
			}
		};
	}];

};
export default SynthDeleteHandlerProvider;
