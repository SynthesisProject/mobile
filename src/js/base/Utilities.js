'use strict';
/**
 * Class for utility methods.
 * This class should only be used for simple utility methods.
 * DO NOT use this class to call services or to do tool specific
 * manipulations - these kind of functionality should be written in controllers or services
 * for the tool
 */
export function getNumberOfProperties(object, field){
	if (object === undefined){
		return 0;
	}
	var toTest = object;
	if (field){
		toTest = object[field];
	}
	return Object.keys(toTest).length;
}

/**
 * Convert an unknown jsonData type to an JSON Object
 */
export function convertToString(jsonData){
	if (typeof jsonData === 'string'){
		return jsonData;
	}
	else if (typeof jsonData === 'object'){
		return JSON.stringify(jsonData);
	}
	else{
		return '';
	}
}


/**
 * Convert an unknown jsonData type to an JSON Object
 */
export function convertToObject(jsonData){
	if (typeof jsonData === 'string'){
		return JSON.parse(jsonData);
	}
	else if (typeof jsonData === 'object'){
		return jsonData;
	}
	else{
		return null;
	}
}


/**
 * Returns a unique ID immediately
 */
export function generateUID(){
	return 'UNIPOOLE_xxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8;
		return v.toString(16);
	});
}
