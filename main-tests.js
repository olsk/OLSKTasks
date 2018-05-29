/*!
 * OLSKTasks
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var assert = require('assert');

var tasksLibrary = require('./main');

var kDefaultTimeInterval = 0.01;
var taskObjectValid = function(array) {
	return {
		OLSKTaskFireTimeInterval: kDefaultTimeInterval,
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
var delayForFireCount = function(inputData) {
	return 1000 * (kDefaultTimeInterval * inputData);
};
var datesEqualWithinThreshold = function(date1, date2, threshold) {
	return Math.max(Math.abs(date1 - date2), threshold) === threshold;
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
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskFireTimeInterval: '1',
		})), false);
	});

	it('returns false if OLSKTaskShouldBePerformed not function', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskShouldBePerformed: true,
		})), false);
	});

	it('returns false if OLSKTaskCallback not function', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskCallback: true,
		})), false);
	});

	it('returns true if valid taskObject', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(taskObjectValid()), true);
	});

	context('OLSKTaskFiresImmediately', function() {

		it('returns false if not boolean', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFiresImmediately: null,
			})), false);
		});

	});

	context('OLSKTaskFireLimit', function() {

		it('returns false if not number', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: '1',
			})), false);
		});

		it('returns false if below 0', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: -1,
			})), false);
		});

	});

	context('_OLSKTaskFireCount', function() {

		it('returns false if not number', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				_OLSKTaskFireCount: '1',
			})), false);
		});

		it('returns false if below 0', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				_OLSKTaskFireCount: -1,
			})), false);
		});

	});

	context('OLSKTaskStartedAt', function() {

		it('returns false if not date', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskStartedAt: null,
			})), false);
		});

	});

	context('OLSKTaskStoppedAt', function() {

		it('returns false if not date', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskStoppedAt: null,
			})), false);
		});

	});

	context('OLSKTaskName', function() {

		it('returns false if not string', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskName: null,
			})), false);
		});

	});

});

describe('OLSKTasksTimeoutForTaskObject', function testOLSKTasksTimeoutForTaskObject() {

	it('throws error if not taskObject', function() {
		assert.throws(function() {
			tasksLibrary.OLSKTasksTimeoutForTaskObject({});
		}, /OLSKErrorInputInvalid/);
	});

	it('returns timerID', function() {
		assert.strictEqual(tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObjectValid()).constructor.name, 'Timeout');
	});

	it('sets _OLSKTaskTimerID to timerID', function() {
		var taskObject = taskObjectValid();
		assert.deepEqual(tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject), taskObject._OLSKTaskTimerID);
	});

	it('can be stopped via clearInterval', function(done) {
		var data = [];

		var timerID = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObjectValid(data));

		setTimeout(function() {
			clearInterval(timerID);

			setTimeout(function() {
				assert.strictEqual(data.length, 1);

				done();
			}, delayForFireCount(1.5));
		}, delayForFireCount(1.5));
	});

	it('fires callback at OLSKTaskFireInterval', function(done) {
		var data = [];

		var timerID = tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObjectValid(data));

		setTimeout(function() {
			clearInterval(timerID);

			assert.strictEqual(data.length, 2);

			done();
		}, delayForFireCount(2.5));
	});

	it('does not fire callback if OLSKTaskShouldBePerformed returns false', function(done) {
		var data = [];

		var taskObject = Object.assign(taskObjectValid(data), {
			OLSKTaskShouldBePerformed: function() {
				return false;
			},
		});

		tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

		setTimeout(function() {
			clearInterval(taskObject._OLSKTaskTimerID);

			assert.strictEqual(data.length, 0);

			done();
		}, delayForFireCount(2.5));
	});

	it('increments _OLSKTaskFireCount after each callback fired', function(done) {
		var taskObject = taskObjectValid();

		tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

		setTimeout(function() {
			clearInterval(taskObject._OLSKTaskTimerID);

			assert.strictEqual(taskObject._OLSKTaskFireCount, 4);

			done();
		}, delayForFireCount(4.7));
	});

	it('sets OLSKTaskStartedAt before firing callback for the first time', function(done) {
		var taskObject = taskObjectValid();

		var startDate = new Date();
		tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

		setTimeout(function() {
			clearInterval(taskObject._OLSKTaskTimerID);

			assert.strictEqual(datesEqualWithinThreshold(taskObject.OLSKTaskStartedAt, startDate, 15), true);

			done();
		}, delayForFireCount(4.5));
	});

	context('OLSKTaskFiresImmediately', function() {

		it('fires immediately if true', function(done) {
			var data = [];

			var taskObject = Object.assign(taskObjectValid(data), {
				OLSKTaskFiresImmediately: true,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

			setTimeout(function() {
				clearInterval(taskObject._OLSKTaskTimerID);

				assert.strictEqual(data.length, 3);

				done();
			}, delayForFireCount(2.5));
		});

	});

	context('OLSKTaskFireLimit', function() {

		it('limits callback fire count', function(done) {
			var data = [];

			var taskObject = Object.assign(taskObjectValid(data), {
				OLSKTaskFireLimit: 3,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

			setTimeout(function() {
				clearInterval(taskObject._OLSKTaskTimerID);

				assert.strictEqual(data.length, 3);

				done();
			}, delayForFireCount(4.5));
		});

		it('sets OLSKTaskStoppedAt after firing callback for the last time', function(done) {
			var taskObject = Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: 3,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(taskObject);

			setTimeout(function() {
				clearInterval(taskObject._OLSKTaskTimerID);

				assert.strictEqual(datesEqualWithinThreshold(taskObject.OLSKTaskStoppedAt, new Date(), 15), true);

				done();
			}, delayForFireCount(5));
		});

	});

});
