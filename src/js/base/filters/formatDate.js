'use strict';
var formatDate = () => {
	return function(date, format) {

		// If there is no format use a default format
		if (!format) {
			format = 'YYYY-MM-DD h:mm a';
		}

		// If there is no date, return an empty string
		if (date === null || date === '') {
			return '';
		}
		return moment(date).format(format);
	};
};
export default formatDate;
