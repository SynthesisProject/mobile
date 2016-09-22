

// Lock key for prompting file access
const FILE_ACCESS_LOCK = 'DataService.FILE_ACCESS_LOCK';

class AccessPermission{

	constructor($q, Lock){
		this.$q = $q;
		this.Lock = Lock;
		this.hasFilePermission = false;
	}

	/**
	 * Returns a promise to get file access
	 */
	_requestFileAccess(){
		var deferred = this.$q.defer();
		var permissions = cordova.plugins.permissions;

		function errorHandler(){
			deferred.reject('Failed to get File Access permission');
		}

		permissions.hasPermission(permissions.WRITE_EXTERNAL_STORAGE, (status)=>{
			if(status.hasPermission){
				deferred.resolve(true);
			}
			else{
				permissions.requestPermission(permissions.WRITE_EXTERNAL_STORAGE, (requestStatus)=>{
					if(requestStatus.hasPermission){
						deferred.resolve(true);
					}
					else{
						deferred.reject('User did not allow file access');
					}
				}, errorHandler);
			}
		}, errorHandler);

		return deferred.promise;
	}

	requestFilePermission(){
		const self = this;
		// Now that cordova is ready check if its android and ask permission
		if(!self.hasFilePermissions && device.platform === 'Android'){
			return self.Lock.getLock(FILE_ACCESS_LOCK)
				.then(()=>{
					// Once we got the lock, check if we still need to ask permission
					if(!self.hasFilePermissions){
						return self._requestFileAccess();
					}
					return true;
				}).then(()=>{
					self.hasFilePermissions = true;
				})
				.then((returnData) => {
					return self.Lock.returnLock(FILE_ACCESS_LOCK, returnData);
				}, (reason) =>{
					return self.Lock.returnLock(FILE_ACCESS_LOCK, reason, false);
				});
		}
		else{
			self.hasFilePermissions = true;
			return this.$q.when(true);
		}
	}

}

var AccessPermissionFactory = function(){
	return new AccessPermission(...arguments);
};
AccessPermissionFactory.$inject = ['$q', 'Lock'];

export default AccessPermissionFactory;
