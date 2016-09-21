'use strict';

/**
* Synthesis Add Fields to Object
*/
var safo = () => {

	function addFieldsToObject(){


		// Get the object that we will be modifying
		var obj = arguments[0];

		// Continue while there are enough groups of fieldname and values left
		for(var idx = 1; idx + 2 <= arguments.length; idx += 2){
			var key = arguments[idx];
			var value = arguments[idx + 1];
			obj[key] = value;
		}

		return obj;
	}


	/**
	* First parameter is the object, the next parameters are in sets
	* of 2 where the first is the name of the field, and the second the value.
	* This function will modify the object that was passed to the function,
	* it will not return any value
	*
	* Example:
	* var myObject = {};
	* function(myObject, "age", 21, "gender", "male");
	*
	* Result:
	* myObject = {
	* 		'age' : 21,
	* 		'gender' : "male"
	*  }
	*
	* You can also pass an array as the first parameter, then all objects
	* in that array will have the fields set to them
	*
	* Example:
	* var myObjectArray = [{}, {}];
	* function(myObjectArray, "age", 21, "gender", "male");
	*
	* Result:
	* myObjectArray = [{
	* 		'age' : 21,
	* 		'gender' : "male"
	*  },
	*  {
	* 		'age' : 21,
	* 		'gender' : "male"
	*  }]
	*/
	return function(){

		// If we didn't get any params
		if(arguments.length == 0){
			return null;
		}

		/*
		* If there is not enough arguments to make any changes to the
		* object, just return the object itself
		*/
		if(arguments.length < 3){
			return arguments[0];
		}

		/*
		*  The array of objects that we will be adding fields to
		*  even if there was a single object passed as the first
		*  argument, we will use an array with one element
		*/
		var arrayOfObjects = null;

		/*
		* If the first object is an array, we will do
		* it for each object
		*/
		if ($.isArray(arguments[0])){
			arrayOfObjects = arguments[0];
		}
		else{
			arrayOfObjects = [arguments[0]];
		}

		// Arguments that we will be passing the the function that does the work
		var args = ['']; // Create blank placeholder
		args = args.concat(Array.prototype.slice.call(arguments, 1)); // Get out the field name and values from the arguments

		// Continue while there are enough groups of field name and values left
		for(var idx = 0; idx < arrayOfObjects.length; idx++){
			args[0] = arrayOfObjects[idx]; // Now add the real object to the arguments list
			addFieldsToObject.apply(this, args);
		}
		return arrayOfObjects;

	};
};
safo.$inject = [];
export default safo;
