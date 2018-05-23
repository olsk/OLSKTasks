/*!
 * OLSKTasks
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var assert = require('assert');

var tasksLibrary = require('./main');

var OLSKTestingTaskObjectValid = function(array) {
	return {
		OLSKTaskFireTimeInterval: 0.01,
		OLSKTaskShouldBePerformed: function() {
			return true;
		},
		OLSKTaskCallback: function() {
			if (!array) {
				return;
			}

			return array.push(new Date());
		},
	};
};

describe('OLSKTasksInputDataIsDateObject', function testOLSKTasksInputDataIsDateObject() {

	it('returns false if not date', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsDateObject(null), false);
	});

	it('returns false if getTime NaN', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsDateObject(new Date('abcd')), false);
	});

	it('returns true', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsDateObject(new Date()), true);
	});

});

describe('OLSKTasksInputDataIsTaskObject', function testOLSKTasksInputDataIsTaskObject() {

	it('returns false if not object', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(null), false);
	});

	it('returns false if OLSKTaskFireTimeInterval not number', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskFireTimeInterval: '1',
		})), false);
	});

	it('returns false if OLSKTaskShouldBePerformed not function', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskShouldBePerformed: true,
		})), false);
	});

	it('returns false if OLSKTaskCallback not function', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskCallback: true,
		})), false);
	});

	it('returns true if valid taskObject', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(OLSKTestingTaskObjectValid()), true);
	});

	it('returns false if OLSKTaskShouldFireImmediately not boolean', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskShouldFireImmediately: null,
		})), false);
	});

	it('returns false if OLSKTaskFireLimit not number', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskFireLimit: '1',
		})), false);
	});

	it('returns false if OLSKTaskFireLimit below 0', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskFireLimit: -1,
		})), false);
	});

	it('returns false if _OLSKTaskFireCount not number', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			_OLSKTaskFireCount: '1',
		})), false);
	});

	it('returns false if _OLSKTaskFireCount below 0', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			_OLSKTaskFireCount: -1,
		})), false);
	});

	it('returns false if OLSKTaskStartedAt not date', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskStartedAt: null,
		})), false);
	});

	it('returns false if OLSKTaskStoppedAt not date', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskStoppedAt: null,
		})), false);
	});

	it('returns false if OLSKTaskName not string', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskName: null,
		})), false);
	});

	it('returns false if OLSKTaskAsyncRateLimit not number', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskAsyncRateLimit: '1',
		})), false);
	});

	it('returns false if OLSKTaskAsyncRateLimit below 1', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			OLSKTaskAsyncRateLimit: 0,
		})), false);
	});

	it('returns false if _OLSKTaskAsyncRunningCount not number', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			_OLSKTaskAsyncRunningCount: '1',
		})), false);
	});

	it('returns false if _OLSKTaskAsyncRunningCount below 0', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(OLSKTestingTaskObjectValid(), {
			_OLSKTaskAsyncRunningCount: -1,
		})), false);
	});

});

describe('OLSKTasksTimeoutForTaskObject', function testOLSKTasksTimeoutForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksTimeoutForTaskObject({});
		}, /OLSKErrorInputInvalid/);
	});

	it('fires callback at OLSKTaskFireInterval', function(done) {
		var data = [];

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(OLSKTestingTaskObjectValid(data));
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 2);
			done();
		}, 0.025 * 1000);
	});

	it('fires immediately if OLSKTaskShouldFireImmediately true', function(done) {
		var data = [];

		var taskObject = OLSKTestingTaskObjectValid(data);
		taskObject.OLSKTaskShouldFireImmediately = true;

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 3);
			done();
		}, 0.025 * 1000);
	});

	it('can be stopped via clearInterval', function(done) {
		var data = [];

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(OLSKTestingTaskObjectValid(data));
		setTimeout(function() {
			clearInterval(timeout);

			setTimeout(function() {
				assert.strictEqual(data.length, 1);
				done();
			}, 0.015 * 1000);
		}, 0.015 * 1000);
	});

	it('does not fire callback if OLSKTaskShouldBePerformed returns false', function(done) {
		var data = [];
		var taskObject = OLSKTestingTaskObjectValid(data);
		taskObject.OLSKTaskShouldBePerformed = function() {
			return false;
		};

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 0);
			done();
		}, 0.025 * 1000);
	});

	it('limits callback fire count to OLSKTaskFireLimit', function(done) {
		var data = [];
		var taskObject = OLSKTestingTaskObjectValid(data);
		taskObject.OLSKTaskFireLimit = 3;

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(data.length, 3);
			done();
		}, 0.045 * 1000);
	});

	it('increments _OLSKTaskFireCount after each callback fired', function(done) {
		var taskObject = OLSKTestingTaskObjectValid();

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._OLSKTaskFireCount, 4);
			done();
		}, 0.05 * 1000);
	});

	it('sets OLSKTaskStartedAt before firing callback for the first time', function(done) {
		var taskObject = OLSKTestingTaskObjectValid();

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		var dateObject = new Date();
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject.OLSKTaskStartedAt.valueOf(), dateObject.valueOf());
			done();
		}, 0.045 * 1000);
	});

	it('sets OLSKTaskStoppedAt after firing callback for the last time', function(done) {
		var taskObject = OLSKTestingTaskObjectValid();
		taskObject.OLSKTaskFireLimit = 3;

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

		setTimeout(function() {
			clearInterval(timeout);

			var dateObject = new Date();
			var diff = dateObject.valueOf() - taskObject.OLSKTaskStoppedAt.valueOf();
			assert.strictEqual(Math.min(10, diff), diff);
			done();
		}, 0.05 * 1000);
	});

	context('OLSKTaskAsyncRateLimit', function() {

		it('limits callback fire count to OLSKTaskAsyncRateLimit', function(done) {
			var taskObject = OLSKTestingTaskObjectValid();
			taskObject.OLSKTaskAsyncRateLimit = 1;
			taskObject.OLSKTaskCallback = function() {
				taskObject._OLSKTaskAsyncRunningCount += 1;
			};

			var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
			setTimeout(function() {
				clearInterval(timeout);

				assert.strictEqual(taskObject._OLSKTaskFireCount, 1);
				assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 1);
				done();
			}, 0.05 * 1000);
		});

		it('starts firing when _OLSKTaskAsyncRunningCount < OLSKTaskAsyncRateLimit', function(done) {
			var taskObject = OLSKTestingTaskObjectValid();
			taskObject.OLSKTaskFireLimit = 2;
			taskObject.OLSKTaskAsyncRateLimit = 1;

			taskObject.OLSKTaskCallback = function() {
				taskObject._OLSKTaskAsyncRunningCount += 1;

				setTimeout(function() {
					taskObject._OLSKTaskAsyncRunningCount -= 1;
				}, 0.01);
			};

			var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
			setTimeout(function() {
				clearInterval(timeout);

				assert.strictEqual(taskObject._OLSKTaskFireCount, 2);
				assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 0);
				done();
			}, 0.05 * 1000);
		});

	});

});

describe('OLSKTasksIncrementAsyncRunningCountForTaskObject', function testOLSKTasksIncrementAsyncRunningCountForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksIncrementAsyncRunningCountForTaskObject({});
		}, /OLSKErrorInputInvalid/);
	});

	it('throws error if without OLSKTaskAsyncRateLimit', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksIncrementAsyncRunningCountForTaskObject(OLSKTestingTaskObjectValid());
		}, /OLSKErrorInputInvalid/);
	});

	it('increments _OLSKTaskAsyncRunningCount', function(done) {
		var taskObject = OLSKTestingTaskObjectValid();
		taskObject.OLSKTaskAsyncRateLimit = 1;

		taskObject.OLSKTaskCallback = function() {
			tasksLibrary.OLSKTasksIncrementAsyncRunningCountForTaskObject(taskObject);
		};

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 1);
			done();
		}, 0.025 * 1000);
		assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 0);
	});

});

describe('OLSKTasksDecrementAsyncRunningCountForTaskObject', function testOLSKTasksDecrementAsyncRunningCountForTaskObject() {

	it('throws error if param1 not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksDecrementAsyncRunningCountForTaskObject({});
		}, /OLSKErrorInputInvalid/);
	});

	it('throws error if without OLSKTaskAsyncRateLimit', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksDecrementAsyncRunningCountForTaskObject(OLSKTestingTaskObjectValid());
		}, /OLSKErrorInputInvalid/);
	});

	it('decrements _OLSKTaskAsyncRunningCount', function(done) {
		var taskObject = OLSKTestingTaskObjectValid();
		taskObject.OLSKTaskFireLimit = 2;
		taskObject.OLSKTaskAsyncRateLimit = 1;

		taskObject.OLSKTaskCallback = function() {
			tasksLibrary.OLSKTasksIncrementAsyncRunningCountForTaskObject(taskObject);

			setTimeout(function() {
				tasksLibrary.OLSKTasksDecrementAsyncRunningCountForTaskObject(taskObject);
			}, 0.001 * 1000);
		};

		var timeout = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);
		setTimeout(function() {
			clearInterval(timeout);

			assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 0);
			assert.strictEqual(taskObject._OLSKTaskFireCount, 2);
			done();
		}, 0.05 * 1000);
		assert.strictEqual(taskObject._OLSKTaskAsyncRunningCount, 0);
	});

});
