'use strict';
import announcements from './announcements';
import resources from './resources';
import schedule from './schedule';

var SynthesisTools = 'synthesis.tools';

angular.module(SynthesisTools, [
	announcements,
	resources,
	schedule
]);

export default SynthesisTools;
