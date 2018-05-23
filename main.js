/*!
 * OLSKTasks
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

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

	if (inputData.OLSKTaskShouldFireImmediately !== undefined) {
		if (typeof inputData.OLSKTaskShouldFireImmediately !== 'boolean') {
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

	if (inputData.OLSKTaskAsyncRateLimit !== undefined) {
		if (typeof inputData.OLSKTaskAsyncRateLimit !== 'number') {
			return false;
		}

		if (inputData.OLSKTaskAsyncRateLimit < 1) {
			return false;
		}
	}

	if (inputData._OLSKTaskAsyncRunningCount !== undefined) {
		if (typeof inputData._OLSKTaskAsyncRunningCount !== 'number') {
			return false;
		}

		if (inputData._OLSKTaskAsyncRunningCount < 0) {
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

	if (inputData.OLSKTaskAsyncRateLimit) {
		inputData._OLSKTaskAsyncRunningCount = 0;
	}

	var taskParentCallback = function() {
		if (!inputData.OLSKTaskShouldBePerformed()) {
			return;
		}

		inputData._OLSKTaskFireCount++;

		inputData.OLSKTaskCallback();
	};

	if (inputData.OLSKTaskShouldFireImmediately === true) {
		taskParentCallback();
	}

	var timerID = setInterval(function() {
		if (inputData._OLSKTaskFireCount >= inputData.OLSKTaskFireLimit) {
			inputData.OLSKTaskStoppedAt = new Date();
			return clearInterval(timerID);
		}

		if ((inputData.OLSKTaskAsyncRateLimit) && inputData._OLSKTaskAsyncRunningCount >= inputData.OLSKTaskAsyncRateLimit) {
			return exports._OLSKTasksLog(inputData, 'RATE LIMIT');
		}

		taskParentCallback();
	}, inputData.OLSKTaskFireTimeInterval * 1000);

	return timerID;
};

//_ OLSKTasksIncrementAsyncRunningCountForTaskObject

exports.OLSKTasksIncrementAsyncRunningCountForTaskObject = function(inputData) {
	if (!exports.OLSKTasksInputDataIsTaskObject(inputData)) {
		throw new Error('OLSKErrorInputInvalid');
	}

	if (!inputData.OLSKTaskAsyncRateLimit) {
		throw new Error('OLSKErrorInputInvalid');
	}

	inputData._OLSKTaskAsyncRunningCount += 1;
};

//_ OLSKTasksDecrementAsyncRunningCountForTaskObject

exports.OLSKTasksDecrementAsyncRunningCountForTaskObject = function(inputData) {
	if (!exports.OLSKTasksInputDataIsTaskObject(inputData)) {
		throw new Error('OLSKErrorInputInvalid');
	}

	if (!inputData.OLSKTaskAsyncRateLimit) {
		throw new Error('OLSKErrorInputInvalid');
	}

	inputData._OLSKTaskAsyncRunningCount -= 1;
};

//_ _OLSKTasksLog

exports._OLSKTasksLog = function(taskObject, messages) {
	if (!kOLSKTasksEnableLogging) {
		return;
	}

	if (!taskObject.OLSKTaskEnableLogging) {
		return;
	}

	var runCount = taskObject._OLSKTaskFireCount;

	if (runCount > 0) {
		var pad = '000000';
		var str = '' + runCount;
		runCount = pad.substring(0, pad.length - str.length) + str;
	}

	console.log(taskObject.OLSKTaskName, runCount, (Array.isArray(messages) ? messages.join(' ') : messages));
};
