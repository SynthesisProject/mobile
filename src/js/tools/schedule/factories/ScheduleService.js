'use strict';
var ScheduleService = ($q, $filter, ModuleService) => {


	/**
	* Check for events with frequency and then add the events that must be generated
	*
	* @param {type} eventData
	*/
	function addRecurringEvents(eventData) {
		var newEvents = [];
		for (var eventId in eventData) {
			assignFrequencyHandler(newEvents, eventData[eventId]);
		}
		for (var j = 0; j < newEvents.length; j++) {
			eventData[newEvents[j].id] = newEvents[j];
		}
	}

	/**
	* Checks which logic to use for the repeating
	*
	* @param {type} newEvents
	* @param {type} event
	*/
	function assignFrequencyHandler(newEvents, event) {
		switch (event.frequency) {
		case 'day':
			addEvents(newEvents, event, 'days', 1);
			break;
		case 'MWF':
			addEvents(newEvents, event, 'days', 1, [1, 3, 5]);
			break;
		case 'TT':
			addEvents(newEvents, event, 'days', 1, [2, 4]);
			break;
		case 'week':
			addEvents(newEvents, event, 'weeks', 1);
			break;
		case 'month':
			addEvents(newEvents, event, 'months', 1);
			break;
		case 'year':
			addEvents(newEvents, event, 'years', 1);
			break;
		default:
			break;
		}
	}


	/**
	* Adds the repeating events to the event list
	*
	* @param {type} newEvents
	* @param {type} event
	* @param {type} addType - 'days', 'months', 'weeks' or 'years'
	* @param {type} multiply - use 2 to make it every second day
	* @param {Array} allowedDays array of day numbers allowed starting Sunday at 0
	* to Saturday at 6
	*/
	function addEvents(newEvents, event, addType, multiply, allowedDays) {
		if (event.recurs_until) {
			var endDate = moment(event.recurs_until);
			var count = 1;
			while (endDate.isAfter(moment(event.start).add(count * multiply, addType))) {
				var start = moment(event.start).add(count * multiply, addType);

				if (!allowedDays || (jQuery.inArray(start.day(), allowedDays)) > -1) {
					var copiedRecurringEvent = {};
					jQuery.extend(copiedRecurringEvent, event);
					copiedRecurringEvent.start = start.toDate();
					copiedRecurringEvent.end = moment(event.end).add(count * multiply, addType).toDate();
					copiedRecurringEvent.id = event.id + '_' + count++;
					newEvents.push(copiedRecurringEvent);
				}
				else{
					count++;
				}
			}
		}
		else {
			var count2 = 1;
			for (var i = 0; count2 < event.recurrence_count; i++) {
				var start2 = moment(event.start).add((i + 1) * multiply, addType);
				if (!allowedDays || (jQuery.inArray(start2.day(), allowedDays)) > -1) {
					var copiedEvent = {};
					jQuery.extend(copiedEvent, event);
					copiedEvent.start = start2.toDate();
					copiedEvent.end = moment(event.end).add((i + 1) * multiply, addType).toDate();
					copiedEvent.id = event.id + '_' + i;
					newEvents.push(copiedEvent);
					count2++;
				}
			}
		}
	}


	class ScheduleServiceImpl {

		constructor(){}

		/**
		* Gets ALL the schedule events
		*/
		getAll(moduleId) {
			return ModuleService.getToolData(moduleId, 'schedule')
			.then((events) => {
				addRecurringEvents(events);
				return events;
			});
		}

		/**
		* Gets a specific event
		*/
		getEvent(moduleId, eventId) {
			return this.getAll()
			.then((events) => {
				return events[eventId];
			});
		}
	}

	return new ScheduleServiceImpl();
};
ScheduleService.$inject = ['$q', '$filter', 'ModuleService', 'SynthFail'];
export default ScheduleService;
