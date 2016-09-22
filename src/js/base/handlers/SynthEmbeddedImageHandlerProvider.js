'use strict';

/**
* These handlers go through the newly downloaded content of a tool
* and update the links to the actual location of the file on the device
*
* The handler will be called with the following parameters
* $1 - toolContent - the new delta of tool content
* $2 - dataPath - The proper root path for attachments
*
* The function must return the object with the fields updated
*
* Example
*
* function myHandler(toolContent){
*   var html = toolContent.fieldThatHasImage;
*   toolContent.fieldThatHasImage = .fixForHtmlElement(html);
*   return toolContent;
* }
*
*/
var SynthEmbeddedImageHandlerProvider = function(){

	// Map of registered handlers
	var handlersMap = {};

	// Add a handler
	this.addHandler = function(toolName, funcHandler){
		if (handlersMap[toolName] == null){ // Do not use === here
			handlersMap[toolName] = funcHandler;
		}
	};

	this.$get = ['$q', '$injector', '$timeout',
		function($q, $injector, $timeout){


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
				* Fix the url of all embedded images
				* This function creates a pseudo jquery html element, and finds all img tags
				* inside the dom.
				* This will replace the image path with a directive that will search for
				* image by referencing "attachements" on the scope where this html is displayed
				*
				* resolveImageFunction(imagePath): returns a promise that resolves to the
				* local path of the image in question
				*/
				fixForHtmlElement : function(htmlContent, resolveImageFunction){
					var dummyData = $('<div/>').html(htmlContent);
					var images = dummyData.find('img');

					// If there is no images, there is nothing to change
					if(images.length === 0){
						return $q.when(htmlContent);
					}
					let promise = $q.when();
					angular.forEach(images, function(image){
						promise = promise.then(function(){
							let currentImage = $(image);
							// Get the current path of the image
							var currentImagePath = currentImage.attr('src');
							return resolveImageFunction(currentImagePath).then((localpath) => {
								currentImage.attr('src', localpath);
							});
						});
					});

					return promise.then(()=>{
						return dummyData.html();
					});
				},
				resolveImageLocalPathFromAttachments : function(imagePath, attachments){

					// There is no attachments, so we will never find it!
					if(attachments.length === 0){
						return $q.when(null);
					}
					// Take out only the filename
					var imageName = imagePath.substr(imagePath.lastIndexOf('/') + 1);
					var deferred = $q.defer();
					$timeout(() => {
						// Loop through all the attachments untill we find the one
						for(var idx in attachments){
							if(attachments[idx].name === imageName){
								deferred.resolve(attachments[idx].downloadPath);
								return;
							}
						}
						// We could not find an image that matches the requested image
						deferred.resolve(null);
					});

					return deferred.promise;
				}
			};

		}];

};

export default SynthEmbeddedImageHandlerProvider;
