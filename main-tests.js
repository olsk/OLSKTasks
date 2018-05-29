/*!
 * OLSKTasks
 * Copyright(c) 2018 Rosano Coutinho
 * MIT Licensed
 */

var assert = require('assert');

var tasksLibrary = require('./main');

var kDefaultTimeInterval = 0.01;
var taskObjectValid = function() {
	var item = {
		OLSKTaskFireTimeInterval: kDefaultTimeInterval,
		OLSKTaskShouldBePerformed: function() {
			return true;
		},
		_OLSKTestingData: [],
		OLSKTaskCallback: function() {
			return item._OLSKTestingData.push(new Date());
		},
	};

	return item;
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

	context('OLSKTaskFireDates', function() {

		it('returns false if not array', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: null,
			})), false);
		});

		it('returns false if array without dates', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [null],
			})), false);
		});

		it('returns true', function() {
			assert.strictEqual(tasksLibrary.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [new Date()],
			})), true);
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
		var item = taskObjectValid();
		assert.deepEqual(tasksLibrary.OLSKTasksTimeoutForTaskObject(item), item._OLSKTaskTimerID);
	});

	it('can be stopped via clearInterval', function(done) {
		var item = taskObjectValid();

		tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			setTimeout(function() {
				assert.strictEqual(item._OLSKTestingData.length, 1);

				done();
			}, delayForFireCount(1.5));
		}, delayForFireCount(1.5));
	});

	it('fires callback at OLSKTaskFireInterval', function(done) {
		var item = taskObjectValid();

		tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			assert.strictEqual(item._OLSKTestingData.length, 2);

			done();
		}, delayForFireCount(2.5));
	});

	it('does not fire callback if OLSKTaskShouldBePerformed returns false', function(done) {
		var item = Object.assign(taskObjectValid(), {
			OLSKTaskShouldBePerformed: function() {
				return false;
			},
		});

		tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			assert.strictEqual(item._OLSKTestingData.length, 0);

			done();
		}, delayForFireCount(2.5));
	});

	it('increments _OLSKTaskFireCount after each callback fired', function(done) {
		var item = taskObjectValid();

		tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			assert.strictEqual(item._OLSKTaskFireCount, 4);

			done();
		}, delayForFireCount(4.7));
	});

	it('sets OLSKTaskStartedAt before firing callback for the first time', function(done) {
		var item = taskObjectValid();

		var startDate = new Date();
		tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			assert.strictEqual(datesEqualWithinThreshold(item.OLSKTaskStartedAt, startDate, 15), true);

			done();
		}, delayForFireCount(4.5));
	});

	context('OLSKTaskFiresImmediately', function() {

		it('fires immediately if true', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFiresImmediately: true,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				assert.strictEqual(item._OLSKTestingData.length, 3);

				done();
			}, delayForFireCount(2.5));
		});

	});

	context('OLSKTaskFireLimit', function() {

		it('limits callback fire count', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: 3,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				assert.strictEqual(item._OLSKTestingData.length, 3);

				done();
			}, delayForFireCount(4.5));
		});

		it('sets OLSKTaskStoppedAt after firing callback for the last time', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: 3,
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				assert.strictEqual(datesEqualWithinThreshold(item.OLSKTaskStoppedAt, new Date(), 15), true);

				done();
			}, delayForFireCount(5));
		});

	});

	context('OLSKTaskFireDates', function() {

		it('does not fire callback at OLSKTaskFireInterval', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(3))
				],
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				assert.strictEqual(item._OLSKTestingData.length, 0);

				done();
			}, delayForFireCount(2.5));
		});

		it('fires callback at first fire date', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(3))
				],
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				assert.strictEqual(item._OLSKTestingData.length, 1);

				done();
			}, delayForFireCount(3.5));
		});

		it('can be stopped via clearTimeout', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(2))
				],
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearTimeout(item._OLSKTaskTimerID);

				setTimeout(function() {
					assert.strictEqual(item._OLSKTestingData.length, 0);

					done();
				}, delayForFireCount(1.5));
			}, delayForFireCount(1.5));
		});

		it('fires callback at second fire date', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(3)),
					new Date((new Date()).valueOf() + delayForFireCount(4)),
				],
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				assert.strictEqual(item._OLSKTestingData.length, 2);

				done();
			}, delayForFireCount(4.5));
		});

		it('sets OLSKTaskStoppedAt after firing callback on the last date', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(3)),
					new Date((new Date()).valueOf() + delayForFireCount(4))
				],
			});

			tasksLibrary.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				assert.strictEqual(datesEqualWithinThreshold(item.OLSKTaskStoppedAt, new Date(), 15), true);

				done();
			}, delayForFireCount(4.2));
		});

	});

});
