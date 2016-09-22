'use strict';
var ResourcesCtrl = ($scope, $filter, $rootScope, $routeParams, $window, $timeout, $q, ResourcesService, DataService, SynthErrorHandler, SynthError) => {

	$rootScope.activePage = 'forums';
	$rootScope.breadcrumbs = [{'name' : 'Resources'}];
	$scope.showResourceInfo = false;	// Flag showing info about the resource
	$scope.loadingResources = true;		// Flag loading the resources to be displayed in the list
	$scope.promptDownloadAll = false;	// Flag is showing download all prompts
	$scope.busyDownloadingAll = false;	// Flag busy downloading all resources
	$scope.downloadAllObject = {};		// Object containing the download all information
	$scope.pageCurrent 		= 1;		// Page the user is currently on
	$scope.pageListAllCount = 0;		// Total number of items that needs to be displayed on pages
	$scope.pageListPageCount = 10;		// Number of items that may be displayed on a page
	$scope.paginationSize 	= 5;		// Limit number for pagination size
	$scope.parentResource = null; 		// Current parent resource we are viewing
	var moduleId = $scope.moduleId = $routeParams.moduleId; // Id of the module we are currently working with

	var pageResourcesAll = null;		// All the resources that needs to be split over pages
	var currentDirectory = null;		// Current resource directory

	$scope.goUp = function(){
		$window.history.back();
	};


	/**
	* Function to download all the resources in the current (recursive) view
	*/
	$scope.downloadAll = function($event){
		$event.stopPropagation();

		function getResourcesToDownloadPromise(){
			return ResourcesService.getUndownloadedChildren(moduleId, currentDirectory);
		}

		getResourcesToDownloadPromise()
		.then(function(resourcesToDownload){
			$scope.downloadAllObject = resourcesToDownload;
			$scope.promptDownloadAll = true;
		});
	};

	/**
	* Callback to start downloading all resources
	*/
	$scope.startDownloadAll = function($event){
		$event.stopPropagation();
		$scope.promptDownloadAll = false;
		$scope.busyDownloadingAll = true;

		// Get the next resource in the list if there is any
		function getDownloadResourcePromise(){
			let promise = $q.when();
			angular.forEach($scope.downloadAllObject.resources, function(resource){
				promise = promise.then(function(){
					return ResourcesService.downloadResource(moduleId, resource)
						.then(function success(){
							// If there is no progress yet we add a zero progress
							if(resource.downloaded === undefined){
								resource.downloaded = 0;
							}
							// When a resource is completly download we add the full size to the progress
							$scope.downloadAllObject.downloaded = ($scope.downloadAllObject.downloaded - resource.downloaded) + resource.size;
							$scope.downloadAllObject.progress = ($scope.downloadAllObject.downloaded / $scope.downloadAllObject.size) * 100;
							$scope.downloadAllObject.downloadedFiles++;
						}, function error(reason){
							return $q.reject(reason);
						}, function notify(notification){
							if(notification.lengthComputable) {
								resource.size = notification.total;
							}
							// If there is no progress yet we add a zero progress
							if(resource.downloaded === undefined){
								resource.downloaded = 0;
							}
							$scope.downloadAllObject.downloaded = ($scope.downloadAllObject.downloaded - resource.downloaded) + notification.loaded;
							resource.downloaded = notification.loaded;
							$scope.downloadAllObject.progress = ($scope.downloadAllObject.downloaded / $scope.downloadAllObject.size) * 100;
						});
				});
			});
			return promise;
		}

		getDownloadResourcePromise()
		.then(function(){ // Success
			$scope.busyDownloadingAll = false;
			openDirectory(currentDirectory);
		}, function(){ // Error
			$scope.busyDownloadingAll = false;
		});
	};

	/**
	* Callback to start downloading all resources
	*/
	$scope.cancelDownloadAll = function($event){
		$event.stopPropagation();
		$scope.promptDownloadAll = false;
	};

	// this function is used to populate the resources
	function openDirectory(id){
		$scope.loadingResources = true;
		$scope.showResourceInfo = false;
		$scope.promptDownloadAll = false;
		currentDirectory = id;
		$timeout(function(){
			ResourcesService.getDirectChildren(moduleId, id).then(function(items){

				var resources = items.sort(function(item1, item2){

					// If both is a directory or file, we go by name
					if((item1.directory && item2.directory) || (!item1.directory && !item2.directory)){
						if(item1.name < item2.name){
							return -1;
						}
						if(item1.name > item2.name){
							return 1;
						}
						return 0;
					}
					// If 1 is a directory and 2 not
					else if(item1.directory && !item2.directory){
						return -1;
					}
					// If 2 is a directory and 1 not
					else{
						return 1;
					}
				});
				// TODO this should move to page
				$scope.loadingResources = false;
				pageResourcesAll = $filter('object2Array')(resources);
				paginationCalculate();
				$scope.paginationUpdate(1);
			});
		}, 500);
	}

	/**
	* Calculate what can fit onto screen and how paging should work
	*/
	function paginationCalculate(){
		$scope.pageListAllCount = pageResourcesAll.length;

	}

	$scope.nextPage = function(){
		if($scope.pageCurrent > 1){
			$scope.paginationUpdate($scope.pageCurrent - 1);
		}
	};

	$scope.previousPage = function(){
		var pageSize = $scope.pageListPageCount,
			itemCount = $scope.pageListAllCount,
			numPages = Math.floor(itemCount / pageSize) + (itemCount % pageSize > 0 ? 1 : 0);
		if($scope.pageCurrent < numPages){
			$scope.paginationUpdate($scope.pageCurrent + 1);
		}
	};

	/**
	* Update the display for the current page
	*/
	$scope.paginationUpdate = function(newPage){
		$scope.pageCurrent = newPage;
		var pageSize = $scope.pageListPageCount,
			itemCount = $scope.pageListAllCount,
			startIdx = (newPage - 1) * pageSize,
			endIdx = Math.min((newPage * pageSize) - 1, itemCount);

		$scope.resources = pageResourcesAll.slice(startIdx, endIdx);
		$scope.myScroll.mainScroll.scrollTo(0, 0);// Scroll to top to see modal
	};

	$scope.showInfo = function(resource, $event){
		$event.stopPropagation();
		$scope.resourceInfo = resource;
		$scope.myScroll.mainScroll.scrollTo(0, 0);// Scroll to top to see modal
		$scope.showResourceInfo = true;
		history.pushState({}, 'Resources', '#/tool/resources/' + moduleId + '/');
	};


	$scope.hideInfo = function(){
		$scope.myScroll.mainScroll.scrollTo(0, 0);// Scroll to top to see modal
		$scope.showResourceInfo = false;
	};

	$scope.openResource = function(resource){

		var openURL = function(path){
			var FileOpener = $window.plugins.FileOpener;
			FileOpener.open({
				'path' : path,
				'mimeType' : resource.mime_type
			},
			function(){

			},
			function(error){
				var synthError;
				// If the error is that there is not application
				if(error == FileOpener.NO_APP){
					synthError = SynthError(4001);
				}
				// We couldn't open the file
				else if(error == FileOpener.FAIL_TO_OPEN){
					synthError = SynthError(4002);
				}
				// Something else went wrong
				else{
					synthError = SynthError(1000);
				}

				/*
				* We need to make this change in an apply scope, because we are changing
				* the angular scope (inside the Error Handler) from outside of an angular
				* thread
				*/
				$rootScope.$apply(function(){
					SynthErrorHandler(synthError);
				});
			});


		};

		// If the resource is a directory, we will navigate into the directory
		if(resource.directory){
			history.pushState(resource, 'Resources', '#/tool/resources/' + moduleId + '/');
			openDirectory(resource.id);
		}
		else if (resource.mime_type == 'text/url') {
			if(resource.linkURL != null){
				cordova.InAppBrowser.open(resource.linkURL, '_system');
			}
		}
		else if(resource.resourceType == 'org.sakaiproject.citation.impl.CitationList'){
			cordova.InAppBrowser.open(resource.url, '_system');
		}
		// If the file is already downloaded we will open it
		else if(resource.isDownloaded){
			openURL(resource.downloadPath);
		}

	};

	/**
	* Download a selected resource
	*/
	$scope.downloadResource = function(resource, $event){
		if($event){
			$event.stopPropagation();
		}

		resource.busyDownloading = true;
		ResourcesService.downloadResource(moduleId, resource)
		.then(
			// Success
			function(result){
				resource.busyDownloading = false;
				resource.isDownloaded = result.isDownloaded;
				resource.downloadPath = result.downloadPath;
			},
			//Failed
			function(reason){
				resource.busyDownloading = false;
				console.log(reason);
			},
			// Notifications
			function(notification){

				// Check the file download progress
				if(notification instanceof ProgressEvent){
					if(notification.lengthComputable) {
						resource.downloadProgress = (notification.loaded / notification.total) * 100;
					}
					else{
						resource.downloadProgress = (notification.loaded / resource.size) * 100;
					}
				}
			});
	};

	/**
	* Delete the specified resource
	*/
	$scope.deleteResource = function(resource, $event){
		// Stop the click event from progating
		if($event){
			$event.stopPropagation();
		}

		navigator.notification.confirm(
			'Are you sure you want to delete the resource?',
			function(index){
				if (index === 2){
					ResourcesService.deleteResource(moduleId, resource.id).then(function(){
						// Update the object passed to this function,
						// so that angular will update the current screen without having to refresh
						if(resource.isDownloaded !== undefined){
							delete resource.isDownloaded;
						}
					}, SynthErrorHandler);
				}
			},
			'Delete resource',
			['No', 'Yes']);
	};

	function popHistory(event){
		if(event.state == null){
			openDirectory(null);
		}
		else{
			openDirectory(event.state.id);
		}
	}
	$window.addEventListener('popstate', popHistory);
	// Cleanup listeners
	$scope.$on('$destroy', function () {
		$window.removeEventListener('popstate', popHistory);
	});

	openDirectory(null);
};
ResourcesCtrl.$inject = ['$scope', '$filter', '$rootScope', '$routeParams', '$window', '$timeout', '$q', 'ResourcesService', 'DataService', 'SynthErrorHandler', 'SynthError'];
export default ResourcesCtrl;
