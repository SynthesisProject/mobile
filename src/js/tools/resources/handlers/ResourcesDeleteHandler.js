'use strict';
var ResourcesDeleteHandler = ($q, $timeout) => {

	return function(data){
		if(data == null || Object.keys(data).length === 0){
			return $q.when({
				data : data,
				deleted : []
			});
		}

		var deferred = $q.defer();
		$timeout(function(){
			var returnData = {
				data : {},
				deleted : []
			};
			// Step through each item
			for (var resourceKey in data) {
				var resource = data[resourceKey];

				// If one is found with 'DELETE'
				if(resource.status || resource.status == 'DELETED'){
					// If we don't have a path for it we can't delete it
					if(resource.downloadPath != null){
						returnData.deleted.push(resource.downloadPath);
					}
				}
				else{
					// Keep the item in the data list
					returnData.data[resourceKey] = resource;
				}
			}
			// return the fixed data
			deferred.resolve(returnData);
		});
		return deferred.promise;
	};

};

ResourcesDeleteHandler.$inject = ['$q', '$timeout'];
export default ResourcesDeleteHandler;
