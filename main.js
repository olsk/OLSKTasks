(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
		typeof define === 'function' && define.amd ? define(['exports'], factory) :
			(factory((global.OLSKTasks = global.OLSKTasks || {})));
}(this, (function(exports) {
	'use strict';

	const mod = {

		OLSKTasksInputDataIsDateObject (inputData) {
			if (!(inputData instanceof Date)) {
				return false;
			}

			if (Number.isNaN(inputData.getTime())) {
				return false;
			}

			return true;
		},

		OLSKTasksInputDataIsTaskObject (inputData) {
			if (typeof inputData !== 'object' || inputData === null) {
				return false;
			}

			if (typeof inputData.OLSKTaskFireTimeInterval !== 'number') {
				return false;
			}

			if (typeof inputData.OLSKTaskShouldBePerformed !== 'function') {
				return false;
			}

			if (typeof inputData.OLSKTaskCallback !== 'function') {
				return false;
			}

			if (inputData.OLSKTaskFiresImmediately !== undefined) {
				if (typeof inputData.OLSKTaskFiresImmediately !== 'boolean') {
					return false;
				}
			}

			if (inputData.OLSKTaskFireDates !== undefined) {
				if (!Array.isArray(inputData.OLSKTaskFireDates)) {
					return false;
				}

				if (!inputData.OLSKTaskFireDates.filter(mod.OLSKTasksInputDataIsDateObject).length) {
					return false;
				}
			}

			if (inputData.OLSKTaskFireLimit !== undefined) {
				if (typeof inputData.OLSKTaskFireLimit !== 'number') {
					return false;
				}

				if (inputData.OLSKTaskFireLimit < 0) {
					return false;
				}
			}

			if (inputData._OLSKTaskFireCount !== undefined) {
				if (typeof inputData._OLSKTaskFireCount !== 'number') {
					return false;
				}

				if (inputData._OLSKTaskFireCount < 0) {
					return false;
				}
			}

			if (inputData.OLSKTaskStartedAt !== undefined) {
				if (!mod.OLSKTasksInputDataIsDateObject(inputData.OLSKTaskStartedAt)) {
					return false;
				}
			}

			if (inputData.OLSKTaskStoppedAt !== undefined) {
				if (!mod.OLSKTasksInputDataIsDateObject(inputData.OLSKTaskStoppedAt)) {
					return false;
				}
			}

			if (inputData.OLSKTaskName !== undefined) {
				if (typeof inputData.OLSKTaskName !== 'string') {
					return false;
				}
			}

			return true;
		},

		OLSKTasksTimeoutForTaskObject (inputData, callbackInput) {
			if (!mod.OLSKTasksInputDataIsTaskObject(inputData)) {
				throw new Error('OLSKErrorInputNotValid');
			}

			inputData._OLSKTaskFireCount = 0;
			inputData.OLSKTaskStartedAt = new Date();

			var taskParentCallback = function() {
				if (!inputData.OLSKTaskShouldBePerformed()) {
					return;
				}

				inputData._OLSKTaskFireCount++;

				inputData.OLSKTaskCallback(callbackInput);
			};

			if (inputData.OLSKTaskFiresImmediately === true) {
				taskParentCallback();
			}

			if (inputData.OLSKTaskFireDates) {
				inputData._OLSKTaskFireDates = inputData.OLSKTaskFireDates.slice(0);

				var timeOutCallback = function() {
					if (!inputData._OLSKTaskFireDates.length) {
						inputData.OLSKTaskStoppedAt = new Date();

						return;
					}

					inputData._OLSKTaskTimerID = setTimeout(function() {
						taskParentCallback();

						timeOutCallback();
					}, inputData._OLSKTaskFireDates.shift() - new Date());

					return inputData._OLSKTaskTimerID;
				};

				return timeOutCallback();
			}

			inputData._OLSKTaskTimerID = setInterval(function() {
				if (inputData._OLSKTaskFireCount >= inputData.OLSKTaskFireLimit) {
					inputData.OLSKTaskStoppedAt = new Date();
					return clearInterval(inputData._OLSKTaskTimerID);
				}

				taskParentCallback();
			}, inputData.OLSKTaskFireTimeInterval * 1000);

			return inputData._OLSKTaskTimerID;
		},

	};

	Object.assign(exports, mod);

	Object.defineProperty(exports, '__esModule', {
		value: true
	});

})));
