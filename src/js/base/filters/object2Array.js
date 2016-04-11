'use strict';
var object2Array = () => {
	return function(input) {
		var out = [];
		for(var i in input){
			var obj = input[i];
			obj.key = i;
			out.push(obj);
		}
		return out;
	};
};
export default object2Array;
