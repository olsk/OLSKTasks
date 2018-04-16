/*!
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var kROCOTasksEnableLogging = true;

//_ ROCOTasksInputDataIsDateObject

exports.ROCOTasksInputDataIsDateObject = function (inputData) {
	if (!(inputData instanceof Date)) {
		return false;
	};
	
	if (Number.isNaN(inputData.getTime())) {
		return false;
	};

	return true;
};

//_ ROCOTasksInputDataIsTaskObject

exports.ROCOTasksInputDataIsTaskObject = function (inputData) {
	if (typeof inputData !== 'object' || inputData === null) {
		return false;
	};

	if (typeof inputData.ROCOTaskFireTimeInterval !== 'number') {
		return false;
	};

	if (typeof inputData.ROCOTaskShouldBePerformed !== 'function') {
		return false;
	};

	if (typeof inputData.ROCOTaskCallback !== 'function') {
		return false;
	};

	if (inputData.ROCOTaskShouldFireImmediately !== undefined) {
		if (typeof inputData.ROCOTaskShouldFireImmediately !== 'boolean') {
			return false;
		};
	};

	if (inputData.ROCOTaskFireLimit !== undefined) {
		if (typeof inputData.ROCOTaskFireLimit !== 'number') {
			return false;
		};

		if (inputData.ROCOTaskFireLimit < 0) {
			return false;
		};
	};

	if (inputData._ROCOTaskFireCount !== undefined) {
		if (typeof inputData._ROCOTaskFireCount !== 'number') {
			return false;
		};

		if (inputData._ROCOTaskFireCount < 0) {
			return false;
		};
	};

	if (inputData.ROCOTaskStartedAt !== undefined) {
		if (!exports.ROCOTasksInputDataIsDateObject(inputData.ROCOTaskStartedAt)) {
			return false;
		};
	};

	if (inputData.ROCOTaskStoppedAt !== undefined) {
		if (!exports.ROCOTasksInputDataIsDateObject(inputData.ROCOTaskStoppedAt)) {
			return false;
		};
	};

	if (inputData.ROCOTaskName !== undefined) {
		if (typeof inputData.ROCOTaskName !== 'string') {
			return false;
		};
	};

	if (inputData.ROCOTaskAsyncRateLimit !== undefined) {
		if (typeof inputData.ROCOTaskAsyncRateLimit !== 'number') {
			return false;
		};

		if (inputData.ROCOTaskAsyncRateLimit < 1) {
			return false;
		};
	};

	if (inputData._ROCOTaskAsyncRunningCount !== undefined) {
		if (typeof inputData._ROCOTaskAsyncRunningCount !== 'number') {
			return false;
		};

		if (inputData._ROCOTaskAsyncRunningCount < 0) {
			return false;
		};
	};

	return true;
};

//_ ROCOTasksTimeoutForTaskObject

exports.ROCOTasksTimeoutForTaskObject = function (inputData) {
	if (!exports.ROCOTasksInputDataIsTaskObject(inputData)) {
		throw new Error('ROCOErrorInputInvalid');
	};

	inputData._ROCOTaskFireCount = 0;
	inputData.ROCOTaskStartedAt = new Date();

	if (inputData.ROCOTaskAsyncRateLimit) {
		inputData._ROCOTaskAsyncRunningCount = 0;
	};

	var callback = function () {
		if (!inputData.ROCOTaskShouldBePerformed()) {
			return;
		};

		inputData._ROCOTaskFireCount++;

		inputData.ROCOTaskCallback();
	};

	if (inputData.ROCOTaskShouldFireImmediately === true) {
		callback();
	};

	var timerID = setInterval(function () {
		if (inputData._ROCOTaskFireCount >= inputData.ROCOTaskFireLimit) {
			inputData.ROCOTaskStoppedAt = new Date();
			return clearInterval(timerID);
		};

		if ((inputData.ROCOTaskAsyncRateLimit) && inputData._ROCOTaskAsyncRunningCount >= inputData.ROCOTaskAsyncRateLimit) {
			return exports._ROCOTasksLog(inputData, 'RATE LIMIT');
		};
		
		callback()
	}, inputData.ROCOTaskFireTimeInterval * 1000);

	return timerID;
};

//_ ROCOTasksIncrementAsyncRunningCountForTaskObject

exports.ROCOTasksIncrementAsyncRunningCountForTaskObject = function (inputData) {
	if (!exports.ROCOTasksInputDataIsTaskObject(inputData)) {
		throw new Error('ROCOErrorInputInvalid');
	};

	if (!inputData.ROCOTaskAsyncRateLimit) {
		throw new Error('ROCOErrorInputInvalid');
	};

	inputData._ROCOTaskAsyncRunningCount += 1;
};

//_ ROCOTasksDecrementAsyncRunningCountForTaskObject

exports.ROCOTasksDecrementAsyncRunningCountForTaskObject = function (inputData) {
	if (!exports.ROCOTasksInputDataIsTaskObject(inputData)) {
		throw new Error('ROCOErrorInputInvalid');
	};

	if (!inputData.ROCOTaskAsyncRateLimit) {
		throw new Error('ROCOErrorInputInvalid');
	};

	inputData._ROCOTaskAsyncRunningCount -= 1;
};

//_ _ROCOTasksLog

exports._ROCOTasksLog = function (taskObject, messages) {
	if (!kROCOTasksEnableLogging) {
		return;
	};

	if (!taskObject.ROCOTaskEnableLogging) {
		return;
	};

	var runCount = taskObject._ROCOTaskFireCount;

	if (runCount > 0) {
		var pad = '000000';
		var str = '' + runCount;
		runCount =  pad.substring(0, pad.length - str.length) + str;
	};
	
	console.log(taskObject.ROCOTaskName, runCount, (Array.isArray(messages) ? messages.join(' ') : messages));
};
