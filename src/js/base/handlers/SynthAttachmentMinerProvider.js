'use strict';

/**
 * An object that manages handlers that have tool specific handlers to manage
 * the mining of attachments in tool specific data.
 *
 * Params:
 * toolName - name of the tool locally to SynthMobile - not SynthService name
 * funcHandler - function for handler - or the word "default" to use default implementation
 *
 * The handler method should conform to the following rules:
 * 1) Accept the tool data as the first parameter of the handler method and the download path as the second.
 * 2) The handler must update the data to include the full local path for the attachments
 * 3) Return an array of files to download. The data structure for these files are:
 *	{
 *	  'downloadKey' : '<the key>',
 *	  'downloadPath' : '<full cdv-file:// path>'
 *
 *	}
 * 4) Return an empty array if there are no attachments to download
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


	this.$get = ['$q', '$injector', '$timeout', 'DataService',
		function($q, $injector, $timeout, DataService){

			/**
			 * Gets the handler for a tool.
			 * @param toolName Name of the tool to get a handler for
			 * @returns The configured handler for the tool.
			 */
			let parseArray = (attachArray = []) => {
					// If there is no array, we can return right now
				if (!attachArray || attachArray.size === 0) {
					return $q.when([]);
				}

				let promise = $q.when();
				let filesToDownload = [];
				angular.forEach(attachArray, function(attachment){
					// Only if the attachment has a download key
					if(attachment.downloadKey != null){
						promise = promise.then(function(){
							return DataService.createNewFile(attachment.name)
								.then((fileEntry) => {
									attachment.downloadPath = fileEntry.toInternalURL();
									filesToDownload.push(attachment);
								});
						});
					}
				});
				return promise.then(() => {
					return filesToDownload;
				});
			};


			/*
			 * Default implementation for downloading attachments
			 * This implementation assumes that the attachments are
			 * on the root level of the content data.
			 */
			var defaultHandler = (contentData) => {
				let promise = $q.when();
				let keys = Object.keys(contentData);
				let filesToDownload = [];
				angular.forEach(keys, function(key){
					promise = promise.then(function(){
						return parseArray(contentData[key].attachments)
							.then((downloadEntries)=>{
								filesToDownload = filesToDownload.concat(downloadEntries);
							});
					});

				});
				return promise.then(function(){
					return filesToDownload;
				});
			};

			return {
				getHandler : function(toolName){
					var handlerName = handlersMap[toolName];
					if(handlerName == null){
						return null;
					}
					if (handlerName === 'default'){
						return defaultHandler;
					}
					return $injector.get(handlerName);
				},
				parseArray : parseArray
			};
		}];
};

export default SynthAttachmentMinerProvider;
