/*!
 * OLSKTasks
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.OLSKTasks = global.OLSKTasks || {})));
}(this, (function (exports) { 'use strict';

	var kOLSKTasksEnableLogging = true;

	//_ OLSKTasksInputDataIsDateObject

	exports.OLSKTasksInputDataIsDateObject = function(inputData) {
		if (!(inputData instanceof Date)) {
			return false;
		}

		if (Number.isNaN(inputData.getTime())) {
			return false;
		}

		return true;
	};

	//_ OLSKTasksInputDataIsTaskObject

	exports.OLSKTasksInputDataIsTaskObject = function(inputData) {
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
			if (!exports.OLSKTasksInputDataIsDateObject(inputData.OLSKTaskStartedAt)) {
				return false;
			}
		}

		if (inputData.OLSKTaskStoppedAt !== undefined) {
			if (!exports.OLSKTasksInputDataIsDateObject(inputData.OLSKTaskStoppedAt)) {
				return false;
			}
		}

		if (inputData.OLSKTaskName !== undefined) {
			if (typeof inputData.OLSKTaskName !== 'string') {
				return false;
			}
		}

		return true;
	};

	//_ OLSKTasksTimeoutForTaskObject

	exports.OLSKTasksTimeoutForTaskObject = function(inputData) {
		if (!exports.OLSKTasksInputDataIsTaskObject(inputData)) {
			throw new Error('OLSKErrorInputInvalid');
		}

		inputData._OLSKTaskFireCount = 0;
		inputData.OLSKTaskStartedAt = new Date();

		var taskParentCallback = function() {
			if (!inputData.OLSKTaskShouldBePerformed()) {
				return;
			}

			inputData._OLSKTaskFireCount++;

			inputData.OLSKTaskCallback();
		};

		if (inputData.OLSKTaskFiresImmediately === true) {
			taskParentCallback();
		}

		inputData._OLSKTaskTimerID = setInterval(function() {
			if (inputData._OLSKTaskFireCount >= inputData.OLSKTaskFireLimit) {
				inputData.OLSKTaskStoppedAt = new Date();
				return clearInterval(inputData._OLSKTaskTimerID);
			}

			taskParentCallback();
		}, inputData.OLSKTaskFireTimeInterval * 1000);

		return inputData._OLSKTaskTimerID;
	};

	Object.defineProperty(exports, '__esModule', { value: true });

})));
