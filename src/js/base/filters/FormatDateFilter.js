'use strict';
/**
 * Filter to format a date
 */
var FormatDateFilter = function(date, format) {

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

/**
 * Factory to create new instances of the FormatDateFilter
 */
export default function FormatDateFilterFactory(){
	return FormatDateFilter;
}
