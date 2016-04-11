'use strict';
var animatedEllipse = ($interval) => {
	return {
		'restrict' : 'E',
		'scope' : false,
		/*'replace' : true,*/
		'link' : function (scope, element, attrs){

			var timerId = null,
				running = false,
				state = 0;

			element.text('\u00a0\u00a0\u00a0');

			// Watch for change in the busy flag
			scope.$watch(attrs.busy, function(value) {
				toggleTimer(value);
			});

			// Make sure to stop timers when the element gets destroyed
			element.on('$destroy', function() {
				toggleTimer(false);
			});


			function toggleTimer(run){
				// If we need to run, and we are not yet running
				if(run && !running){
					running = true;
					state = 0;
					timerId = $interval(function() {
						updateAnimation(); // update DOM
					}, 1100);
				}
				// Else id we need to stop and we are running
				else if(!run && running){
					$interval.cancel(timerId);
					element.text('\u00a0\u00a0\u00a0');
					running = false;
				}
			}


			function updateAnimation(){
				switch(state){
				case 0:
					element.text('.\u00a0\u00a0');
					break;
				case 1:
					element.text('..\u00a0');
					break;
				case 2:
					element.text('...');
					break;
				}

				if(state == 2){
					state = 0;
				}
				else{
					state = state + 1;
				}
			}
		}
	};
};
animatedEllipse.$inject = ['$interval'];
export default animatedEllipse;
