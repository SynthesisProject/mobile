'use strict';

/**
 * Spinner used during application boot
 */
class BootSpinner {

	constructor(){
		this.restrict = 'E';
		this.scope = false;
	}

	link(scope, element){
		var opts = {
			lines : 15, // The number of lines to draw
			length : 0, // The length of each line
			width : 30, // The line thickness
			radius : 90, // The radius of the inner circle
			corners : 1, // Corner roundness (0..1)
			rotate : 0, // The rotation offset
			direction : 1, // 1: clockwise, -1: counterclockwise
			color : '#000', // #rgb or #rrggbb or array of colors
			speed : 1, // Rounds per second
			trail : 35, // Afterglow percentage
			shadow : false, // Whether to render a shadow
			hwaccel : true, // Whether to use hardware acceleration
			className : 'spinner', // The CSS class to assign to the spinner
			zIndex : 2e9, // The z-index (defaults to 2000000000)
			top : '50%', // Top position relative to parent
			left : '50%' // Left position relative to parent
		};
		/*eslint no-undef: 0*/
		new Spinner(opts).spin(element[0]);
		// TODO This should probably get distroyed?
	}
}

export default function BootSpinnerFactory(){
	return new BootSpinner();
}
