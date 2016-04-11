'use strict';
var AnnouncementsDeleteHandler = ($q, $timeout) => {

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
			for (var announcementKey in data) {
				var announcement = data[announcementKey];

				// If one is found with 'DELETE'
				if(announcement.status || announcement.status == 'DELETED'){
					// Add files of the announcement to delete
					// returnData.deleted.push();
				}
				else{
					// Keep the item in the data list
					returnData.data[announcementKey] = announcement;
				}
			}
			// return the fixed data
			deferred.resolve(returnData);
		});
		return deferred.promise;
	};

};
AnnouncementsDeleteHandler.$inject = ['$q', '$timeout'];
export default AnnouncementsDeleteHandler;
