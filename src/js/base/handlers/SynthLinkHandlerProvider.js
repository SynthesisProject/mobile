'use strict';

/**
* Handlers to replace links embedded in tool content to links that open
* in an external browser. The problem with embedded links is that they will
* 'takeover' your webview (i.e. your app!)
*
* These handlers will need to find all the links and fix thems
*/
var SynthLinkHandlerProvider = function(){
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

	this.$get = ['$injector', '$q', '$timeout', function($injector, $q, $timeout){
		return {
			// Get a handler
			getHandler : function(toolName){
				var handlerName = handlersMap[toolName];
				if(handlerName == null){
					return null;
				}
				return $injector.get(handlerName);
			},
			/*
			* Fixes all the links in the content string, and return back to fix
			* html string
			*/
			fixContent : function(contentString){
				var deferred = $q.defer();

				$timeout(()=>{
					var dummyData = $('<div/>').html(contentString);

					// Replace all the links, with javascript to open it externally
					dummyData.find('a[href]').each(function() {
						var url = $(this).attr('href');
						$(this).attr('href', `javascript:window.open('${url}', '_system');`);
					});

					// Return the new fixed html
					deferred.resolve(dummyData.html());
				});

				return deferred.promise;
			}
		};
	}];
};
export default SynthLinkHandlerProvider;
