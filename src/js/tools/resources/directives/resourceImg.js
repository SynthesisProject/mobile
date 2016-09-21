'use strict';
var resourceImg = (ResourcesService) => {
	return {
		'restrict' : 'E',
		'templateUrl' : 'tools/resources/partials/resourceImg.html',
		'scope' : {},
		/*'replace' : true,*/
		'link' : function (scope, element, attr) {

			// Set attributes to scope
			scope.src = attr.src;
			scope.width = attr.width;
			scope.height = attr.height;
			scope.initialising = true;

			var resource = {};

			// Get the resource
			ResourcesService.getItem(attr.resourceId).then(function (r) {
				scope.resource = resource = r;
				scope.initialising = false;
			});

			// Callback to download the image
			scope.download = function () {

				// Stop pizza buyers
				if (!resource.busyDownloading) {
					resource.busyDownloading = true;
					ResourcesService.downloadResource(resource)
					.then(
						// Success
						function () {
							resource.busyDownloading = false;
							resource.isDownloaded = true;
						},
						//Failed
						function (reason) {
							resource.busyDownloading = false;
							console.log(reason);
						},
						// Notifications
						function (notification) {

							// Check the file download progress
							if (notification instanceof ProgressEvent) {
								if (notification.lengthComputable) {
									resource.downloadProgress = (notification.loaded / notification.total) * 100;
								}
								else {
									resource.downloadProgress = (notification.loaded / resource.size) * 100;
								}
							}
						});
				}
			};
		}
	};
};
resourceImg.$inject = ['ResourcesService'];
export default resourceImg;
