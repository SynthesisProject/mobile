'use strict';
var resourceListItem = () => {
	return {
		'restrict' : 'A',
		'templateUrl' : 'tools/resources/partials/resourceListItem.html',
		/*'replace' : true,*/
		'link' : function (scope){

			// If the resource is an url, we can pretent that it is downloaded
			if (scope.resource.mime_type == 'text/url' || scope.resource.resourceType == 'org.sakaiproject.citation.impl.CitationList'){
				scope.resource.isDownloaded = true;
				scope.resource.noDelete = true;
			}
		}
	};
};
resourceListItem.$inject = [];
export default resourceListItem;
