'use strict';
var ResourcesService = ($q, DataService, ModuleService, SyncAPIService, LoggerService) => {

	// A reference to a logger
	var LOG = LoggerService('ResourcesService');

	class ResourcesServiceImpl {
		_getData (moduleId){
			return ModuleService.getMergedToolData(moduleId, 'resources');
		}

		getItem(moduleId, id){
			return this._getData(moduleId).then(function(data){
				return data[id];
			});
		}

		/**
		* Get the parent directory object from the parent id
		*/
		getParent(moduleId, id){
			var pid = id;
			/**
			* This is a bit of a hack to get resources to work between Moodle and Sakai
			* Is the module id that we are working with is not fully numeric, it is assumed
			* to be a sakai module, therefore we have to add the /group id for the resource
			*
			* Else, if the number is fully numeric, it is a moodle module.
			*/
			if(pid == null){
				// 1 Check
				if (isNaN(moduleId)) {
					pid = '/group/' + moduleId + '/';
					return this.getItem(moduleId, pid);
				}
				// 2 Do moodle fancy stuff, and set pid to the resource you want
				return this._getData(moduleId).then(function (data) {
					for (var idx in data) {
						if (data.hasOwnProperty(idx)) {
							var item = data[idx];
							if (item.treeId.lastIndexOf(item.treeParentId, 0) === 0) {
								return item;
							}
						}
					}
					return null;
				});
			}
			return this.getItem(moduleId, pid);
		}


		/**
		* Gets all the children recursively that still needs to be downloaded
		*/
		getUndownloadedChildren(moduleId, parentId){
			var self = this;
			/*
			* Returns a promise to get the parent
			*/
			function getParentPromise(){
				return self.getParent(moduleId, parentId);
			}

			/*
			* A promise that will return a list of resources that must still be downloaded
			*/
			function findResourcesPromise(parentObject){
				var deferred = $q.defer();

				self._getData(moduleId).then(function(data){
					var directoryStack = [parentObject]; // List of directories still to be scanned
					var currentDirectory = null;
					var downloadObject = {
						'size' : 0,				// Total size of what we need to download
						'downloaded' : 0,		// Amount of data that we have downloaded
						'progress' : 0,			// Percentage of completion
						'downloadedFiles' : 0,	// Number of files that has been downloaded
						'resources' : []		// Resources we need to download
					};

					// Loop until there is nothing more
					while(directoryStack.length > 0){

						// Find the next directory in the stack
						currentDirectory = directoryStack.splice(0, 1)[0];
						LOG.debug('Currently looking at directory : ' + JSON.stringify(currentDirectory));

						// Loop through all of the data to find children
						for(var idx in data){
							var item = data[idx];

							// If this is a child from the parent
							if(item.treeParentId == currentDirectory.treeId){
								if(item.directory == true){
									LOG.debug('Adding directory to stack: ' + JSON.stringify(item));
									directoryStack.push(item);

								// Ignore urls and citations, we won't be downloading them
								}
								else if(item.mime_type == 'text/url' || item.resourceType == 'org.sakaiproject.citation.impl.CitationList'){
									delete data[item.id]; // remove this item from the big list

								// Add files that are not downloaded, ignoring urls
								}
								else if(!item.isDownloaded){
									LOG.debug('Adding file to list: ' + JSON.stringify(item));
									downloadObject.size += item.size;
									downloadObject.resources.push(item);
									delete data[item.id]; // remove this item from the big list
								}
							}
						}
					}
					deferred.resolve(downloadObject);
				});
				return deferred.promise;
			}

			return getParentPromise()
			.then(findResourcesPromise);
		}


		getDirectChildren(moduleId, parentId){
			var self = this;

			/*
			* Returns a promise to get the parent
			*/
			function getParentPromise(){
				return self.getParent(moduleId, parentId);
			}

			/*
			* Returns a promise to get the children
			*/
			function getChildrenPromise(parent){
				return self._getData(moduleId).then(function(data){
					var pId = parent == null ? null : parent.treeId;

					/* remove the trailing slash if there is one
					if(pId.lastIndexOf('/')+1 === pId.length){
					pId = pId.substring(0,pId.length-1);
				}*/

					var items = [];
					for(var key in data){
						var item = data[key];
						if(item.treeParentId === pId){
							items.push(item);
						}
					}
					return items;
				});
			}

			return getParentPromise()
			.then(getChildrenPromise);
		}


		/**
		* Returns a promise to physically delete and update the resources tool content for the
		* specified resource ID
		*/
		deleteResource(moduleId, resourceId){
			var self = this;		// A reference to ourself
			var resource = null; 	// The resource we are working with

			/**
			* Returns a promise to get the resource for an ID
			*/
			function getResourcePromise(){
				return self.getItem(moduleId, resourceId).then(function(theResource){
					resource = theResource;
					if(resource.isDownloaded !== undefined){
						delete resource.isDownloaded;
					}
					return theResource;
				});
			}

			/**
			* Returns a promise to physically delete the file from the filesystem
			*/
			function getDeleteFilePromise(resourceToDelete){
				var deletePath = resourceToDelete.treeId.replace(/[|&:;$%@'<>()+,]/g, '_');
				return DataService.deleteToolFile(moduleId, 'resources', deletePath);
			}

			/**
			* Returns a promise to persist the changes made to the resource to the filesystem
			*/
			function getSaveContentPromise(){
				var mergeData = {};
				mergeData[resource.id] = resource;
				return ModuleService.mergeToToolData(moduleId, 'resources', mergeData, false);
			}


			// Start the chain of actions
			return getResourcePromise()
			.then(getDeleteFilePromise)
			.then(getSaveContentPromise);
		}


		/**
		* Downloads a resource to the tool's data.
		* This function will also update the tool data to indicate that the resource
		* has been downloaded.
		*/
		downloadResource(moduleId, resource){
			var resourceAttachment;
			/*
			* Returns a promise to create an array of attachments to download.
			* This array will only contain one attachment for this resource
			*/
			function getAttachmentPromise(){
				var filename = resource.name;
				return DataService.createNewFile(filename).then((fileEntry) => {
					resourceAttachment = {
						'downloadKey' : resource.downloadKey,
						'downloadPath' : fileEntry.toInternalURL()
					};
				});
			}

			// Returns a promise to download the file
			function getDownloadAttachmentsPromise(){
				return SyncAPIService.getFileFromServer(resourceAttachment.downloadKey, resourceAttachment.downloadPath);
			}

			// Returns a promise to update the tool data that the resource is downloaded
			function getUpdateToolDataPromise(){
				var mergeData = {};
				mergeData[resource.id] = {
					'isDownloaded' : true,
					'downloadPath' : resourceAttachment.downloadPath
				};
				return ModuleService.mergeToToolData(moduleId, 'resources', mergeData, false).then(function(){
					return mergeData[resource.id];
				});
			}

			return getAttachmentPromise()
			.then(getDownloadAttachmentsPromise)
			.then(getUpdateToolDataPromise);
		}

	}
	return new ResourcesServiceImpl();
};
ResourcesService.$inject = ['$q', 'DataService', 'ModuleService', 'SyncAPIService', 'LoggerService'];
export default ResourcesService;
