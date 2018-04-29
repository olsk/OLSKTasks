/*!
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var assert = require('assert');
var kConstants = require('../kConstants/testing.main').ROCOTestingConstants();

var tasksLibrary = require('./main');

describe('ROCOTasksInputDataIsDateObject', function testROCOTasksInputDataIsDateObject() {

	it('returns false if not date', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsDateObject(null), false);
	});

	it('returns false if getTime NaN', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsDateObject(new Date('abcd')), false);
	});

	it('returns true', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsDateObject(new Date()), true);
	});

});

describe('ROCOTasksInputDataIsTaskObject', function testROCOTasksInputDataIsTaskObject() {

	it('returns false if not object', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(null), false);
	});

	it('returns false if ROCOTaskFireTimeInterval not number', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskFireTimeInterval: '1',
		})), false);
	});

	it('returns false if ROCOTaskShouldBePerformed not function', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskShouldBePerformed: true,
		})), false);
	});

	it('returns false if ROCOTaskCallback not function', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskCallback: true,
		})), false);
	});

	it('returns true if valid taskObject', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(kConstants.ROCOTestingTaskObjectValid()), true);
	});

	it('returns false if ROCOTaskShouldFireImmediately not boolean', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskShouldFireImmediately: null,
		})), false);
	});

	it('returns false if ROCOTaskFireLimit not number', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskFireLimit: '1',
		})), false);
	});

	it('returns false if ROCOTaskFireLimit below 0', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskFireLimit: -1,
		})), false);
	});

	it('returns false if _ROCOTaskFireCount not number', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			_ROCOTaskFireCount: '1',
		})), false);
	});

	it('returns false if _ROCOTaskFireCount below 0', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			_ROCOTaskFireCount: -1,
		})), false);
	});

	it('returns false if ROCOTaskStartedAt not date', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskStartedAt: null,
		})), false);
	});

	it('returns false if ROCOTaskStoppedAt not date', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskStoppedAt: null,
		})), false);
	});

	it('returns false if ROCOTaskName not string', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskName: null,
		})), false);
	});

	it('returns false if ROCOTaskAsyncRateLimit not number', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskAsyncRateLimit: '1',
		})), false);
	});

	it('returns false if ROCOTaskAsyncRateLimit below 1', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			ROCOTaskAsyncRateLimit: 0,
		})), false);
	});

	it('returns false if _ROCOTaskAsyncRunningCount not number', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			_ROCOTaskAsyncRunningCount: '1',
		})), false);
	});

	it('returns false if _ROCOTaskAsyncRunningCount below 0', function() {
		assert.strictEqual(tasksLibrary.ROCOTasksInputDataIsTaskObject(Object.assign(kConstants.ROCOTestingTaskObjectValid(), {
			_ROCOTaskAsyncRunningCount: -1,
		})), false);
	});

});

describe('ROCOTasksTimeoutForTaskObject', function testROCOTasksTimeoutForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.ROCOTasksTimeoutForTaskObject({});
		}, /ROCOErrorInputInvalid/);
	});

	it('fires callback at ROCOTaskFireInterval', function(done) {
		var data = [];

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(kConstants.ROCOTestingTaskObjectValid(data));
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 2);
			done();
		}, 0.025 * 1000);
	});

	it('fires immediately if ROCOTaskShouldFireImmediately true', function(done) {
		var data = [];

		var taskObject = kConstants.ROCOTestingTaskObjectValid(data);
		taskObject.ROCOTaskShouldFireImmediately = true;

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 3);
			done();
		}, 0.025 * 1000);
	});

	it('can be stopped via clearInterval', function(done) {
		var data = [];

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(kConstants.ROCOTestingTaskObjectValid(data));
		setTimeout(function() {
			clearInterval(timeout);

			setTimeout(function() {
				assert.strictEqual(data.length, 1);
				done();
			}, 0.015 * 1000);
		}, 0.015 * 1000);
	});

	it('does not fire callback if ROCOTaskShouldBePerformed returns false', function(done) {
		var data = [];
		var taskObject = kConstants.ROCOTestingTaskObjectValid(data);
		taskObject.ROCOTaskShouldBePerformed = function() {
			return false;
		};

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 0);
			done();
		}, 0.025 * 1000);
	});

	it('limits callback fire count to ROCOTaskFireLimit', function(done) {
		var data = [];
		var taskObject = kConstants.ROCOTestingTaskObjectValid(data);
		taskObject.ROCOTaskFireLimit = 3;

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 3);
			done();
		}, 0.045 * 1000);
	});

	it('increments _ROCOTaskFireCount after each callback fired', function(done) {
		var taskObject = kConstants.ROCOTestingTaskObjectValid();

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._ROCOTaskFireCount, 4);
			done();
		}, 0.05 * 1000);
	});

	it('sets ROCOTaskStartedAt before firing callback for the first time', function(done) {
		var taskObject = kConstants.ROCOTestingTaskObjectValid();

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		var dateObject = new Date();
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject.ROCOTaskStartedAt.valueOf(), dateObject.valueOf());
			done();
		}, 0.045 * 1000);
	});

	it('sets ROCOTaskStoppedAt after firing callback for the last time', function(done) {
		var taskObject = kConstants.ROCOTestingTaskObjectValid();
		taskObject.ROCOTaskFireLimit = 3;

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);

		setTimeout(function() {
			clearInterval(timeout);

			var dateObject = new Date();
			var diff = dateObject.valueOf() - taskObject.ROCOTaskStoppedAt.valueOf();
			assert.strictEqual(Math.min(10, diff), diff);
			done();
		}, 0.05 * 1000);
	});

	context('ROCOTaskAsyncRateLimit', function() {

		it('limits callback fire count to ROCOTaskAsyncRateLimit', function(done) {
			var taskObject = kConstants.ROCOTestingTaskObjectValid();
			taskObject.ROCOTaskAsyncRateLimit = 1;
			taskObject.ROCOTaskCallback = function() {
				taskObject._ROCOTaskAsyncRunningCount += 1;
			};

			var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
			setTimeout(function() {
				clearInterval(timeout);

				assert.strictEqual(taskObject._ROCOTaskFireCount, 1);
				assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 1);
				done();
			}, 0.05 * 1000);
		});

		it('starts firing when _ROCOTaskAsyncRunningCount < ROCOTaskAsyncRateLimit', function(done) {
			var taskObject = kConstants.ROCOTestingTaskObjectValid();
			taskObject.ROCOTaskFireLimit = 2;
			taskObject.ROCOTaskAsyncRateLimit = 1;

			taskObject.ROCOTaskCallback = function() {
				taskObject._ROCOTaskAsyncRunningCount += 1;

				setTimeout(function() {
					taskObject._ROCOTaskAsyncRunningCount -= 1;
				}, 0.01);
			};

			var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
			setTimeout(function() {
				clearInterval(timeout);

				assert.strictEqual(taskObject._ROCOTaskFireCount, 2);
				assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 0);
				done();
			}, 0.05 * 1000);
		});

	});

});

describe('ROCOTasksIncrementAsyncRunningCountForTaskObject', function testROCOTasksIncrementAsyncRunningCountForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.ROCOTasksIncrementAsyncRunningCountForTaskObject({});
		}, /ROCOErrorInputInvalid/);
	});

	it('throws error if without ROCOTaskAsyncRateLimit', function() {
		assert.throws(function() {
			tasksLibrary.ROCOTasksIncrementAsyncRunningCountForTaskObject(kConstants.ROCOTestingTaskObjectValid());
		}, /ROCOErrorInputInvalid/);
	});

	it('increments _ROCOTaskAsyncRunningCount', function(done) {
		var taskObject = kConstants.ROCOTestingTaskObjectValid();
		taskObject.ROCOTaskAsyncRateLimit = 1;

		taskObject.ROCOTaskCallback = function() {
			tasksLibrary.ROCOTasksIncrementAsyncRunningCountForTaskObject(taskObject);
		};

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 1);
			done();
		}, 0.025 * 1000);
		assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 0);
	});

});

describe('ROCOTasksDecrementAsyncRunningCountForTaskObject', function testROCOTasksDecrementAsyncRunningCountForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.ROCOTasksDecrementAsyncRunningCountForTaskObject({});
		}, /ROCOErrorInputInvalid/);
	});

	it('throws error if without ROCOTaskAsyncRateLimit', function() {
		assert.throws(function() {
			tasksLibrary.ROCOTasksDecrementAsyncRunningCountForTaskObject(kConstants.ROCOTestingTaskObjectValid());
		}, /ROCOErrorInputInvalid/);
	});

	it('decrements _ROCOTaskAsyncRunningCount', function(done) {
		var taskObject = kConstants.ROCOTestingTaskObjectValid();
		taskObject.ROCOTaskFireLimit = 2;
		taskObject.ROCOTaskAsyncRateLimit = 1;

		taskObject.ROCOTaskCallback = function() {
			tasksLibrary.ROCOTasksIncrementAsyncRunningCountForTaskObject(taskObject);

			setTimeout(function() {
				tasksLibrary.ROCOTasksDecrementAsyncRunningCountForTaskObject(taskObject);
			}, 0.001 * 1000);
		};

		var timeout = tasksLibrary.ROCOTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 0);
			assert.strictEqual(taskObject._ROCOTaskFireCount, 2);
			done();
		}, 0.05 * 1000);
		assert.strictEqual(taskObject._ROCOTaskAsyncRunningCount, 0);
	});

});
