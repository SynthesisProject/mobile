/**
 * Service for the home screen
 */
class HomeService{

	constructor(ModuleService){
		this.moduleService = ModuleService;
	}

	/**
	 * Get the tools to display on the home screen
	 */
	getHomeTools(){
		return this.moduleService.getAllHomeToolsSorted();
	}
}

/**
 * Export a factory to create a new HomeService
 */
var HomeServiceFactory = function (){
	return new HomeService(...arguments);
};
HomeServiceFactory.$inject = ['ModuleService'];
export default HomeServiceFactory;
