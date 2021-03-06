'use strict';

/**
 * A class providing a synchronisation lock
 */
class Lock{

	constructor($q, $timeout){
		this.$q = $q;
		this.$timeout = $timeout;
		this.lockMap = {}; // Map of pending "threads" for a lock
	}

	/**
	 * @param key They key we are locking on
	 * @param failOnLocked Flag if the promise should immediatly reject if we are not exclusively locking
	 */
	getLock(key, failOnLocked = false){
		if(this.lockMap[key] == null){
			this.lockMap[key] = [];
		}
		// Add ourself to the lock map
		this.lockMap[key][this.lockMap[key].length] = this.$q.defer();

		// If we are the only pending promise, we can resolve
		if(this.lockMap[key].length === 1){
			let resolveKey = key;
			this.$timeout(() => {
				this.lockMap[resolveKey][0].resolve();
			}, 1);
		}
		else if(failOnLocked === true){
			let resolveKey = key;
			this.$timeout(() => {
				this.lockMap[resolveKey][0].reject();
			}, 1);
		}
		return this.lockMap[key][this.lockMap[key].length - 1].promise;
	}

	/**
	 * Resolves the promise of the next queued "thread" waiting for a lock
	 */
	_resolveNextLock(key){
		if(this.lockMap[key] != null){
			if(this.lockMap[key].length === 0){
				delete this.lockMap[key];
			}
			else{
				let resolveKey = key;
				this.$timeout(() => {
					this.lockMap[resolveKey][0].resolve();
				}, 1);
			}
		}
	}

	/**
	 * Returns a aquired lock
	 * @param key The Key of the lock to return
	 * @param returnData the data to return with the resolved promise
	 * @param resolve If true, the promise will be resolve, if false, a rejected promise will be returns
	 */
	returnLock(key, returnData = true, resolve = true){
		this.lockMap[key].splice(0, 1);
		this._resolveNextLock(key);
		if(resolve){
			return this.$q.when(returnData);
		}
		else{
			return this.$q.reject(returnData);
		}
	}
}

/**
 * Factory to create a Lock
*/
var LockFactory = function(){
	return new Lock(...arguments);
};
LockFactory.$inject = ['$q', '$timeout'];
export default LockFactory;
