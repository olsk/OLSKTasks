const { throws, deepEqual } = require('assert');

const mod = require('./main.js');

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

describe('OLSKTasksInputDataIsDateObject', function test_OLSKTasksInputDataIsDateObject() {

	it('returns false if not date', function() {
		deepEqual(mod.OLSKTasksInputDataIsDateObject(null), false);
	});

	it('returns false if getTime NaN', function() {
		deepEqual(mod.OLSKTasksInputDataIsDateObject(new Date('abcd')), false);
	});

	it('returns true', function() {
		deepEqual(mod.OLSKTasksInputDataIsDateObject(new Date()), true);
	});

});

describe('OLSKTasksInputDataIsTaskObject', function test_OLSKTasksInputDataIsTaskObject() {

	it('returns false if not object', function() {
		deepEqual(mod.OLSKTasksInputDataIsTaskObject(null), false);
	});

	it('returns false if OLSKTaskFireTimeInterval not number', function() {
		deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskFireTimeInterval: '1',
		})), false);
	});

	it('returns false if OLSKTaskShouldBePerformed not function', function() {
		deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskShouldBePerformed: true,
		})), false);
	});

	it('returns false if OLSKTaskCallback not function', function() {
		deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
			OLSKTaskCallback: true,
		})), false);
	});

	it('returns true if valid taskObject', function() {
		deepEqual(mod.OLSKTasksInputDataIsTaskObject(taskObjectValid()), true);
	});

	context('OLSKTaskFiresImmediately', function() {

		it('returns false if not boolean', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFiresImmediately: null,
			})), false);
		});

	});

	context('OLSKTaskFireLimit', function() {

		it('returns false if not number', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: '1',
			})), false);
		});

		it('returns false if below 0', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: -1,
			})), false);
		});

	});

	context('OLSKTaskFireDates', function() {

		it('returns false if not array', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: null,
			})), false);
		});

		it('returns false if array without dates', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [null],
			})), false);
		});

		it('returns true', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [new Date()],
			})), true);
		});

	});

	context('_OLSKTaskFireCount', function() {

		it('returns false if not number', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				_OLSKTaskFireCount: '1',
			})), false);
		});

		it('returns false if below 0', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				_OLSKTaskFireCount: -1,
			})), false);
		});

	});

	context('OLSKTaskStartedAt', function() {

		it('returns false if not date', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskStartedAt: null,
			})), false);
		});

	});

	context('OLSKTaskStoppedAt', function() {

		it('returns false if not date', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskStoppedAt: null,
			})), false);
		});

	});

	context('OLSKTaskName', function() {

		it('returns false if not string', function() {
			deepEqual(mod.OLSKTasksInputDataIsTaskObject(Object.assign(taskObjectValid(), {
				OLSKTaskName: null,
			})), false);
		});

	});

});

describe('OLSKTasksTimeoutForTaskObject', function test_OLSKTasksTimeoutForTaskObject() {

	it('throws error if not taskObject', function() {
		throws(function() {
			mod.OLSKTasksTimeoutForTaskObject({});
		}, /OLSKErrorInputNotValid/);
	});

	it('returns timerID', function() {
		deepEqual(mod.OLSKTasksTimeoutForTaskObject(taskObjectValid()).constructor.name, 'Timeout');
	});

	it('sets _OLSKTaskTimerID to timerID', function() {
		var item = taskObjectValid();
		deepEqual(mod.OLSKTasksTimeoutForTaskObject(item), item._OLSKTaskTimerID);
	});

	it('passes param2 to callback', function(done) {
		var item = Object.assign(taskObjectValid(), {
			OLSKTaskFiresImmediately: true,
			OLSKTaskFireLimit: 1,
		});

		item.OLSKTaskCallback = function(input) {
			return item._OLSKTestingData.push(input);
		};

		mod.OLSKTasksTimeoutForTaskObject(item, 'alfa');

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			setTimeout(function() {
				deepEqual(item._OLSKTestingData, [
					'alfa',
					]);

				done();
			}, delayForFireCount(1.5));
		}, delayForFireCount(1.5));
	});

	it('can be stopped via clearInterval', function(done) {
		var item = taskObjectValid();

		mod.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			setTimeout(function() {
				deepEqual(item._OLSKTestingData.length, 1);

				done();
			}, delayForFireCount(1.5));
		}, delayForFireCount(1.5));
	});

	it('fires callback at OLSKTaskFireInterval', function(done) {
		var item = taskObjectValid();

		mod.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			deepEqual(item._OLSKTestingData.length, 2);

			done();
		}, delayForFireCount(2.5));
	});

	it('does not fire callback if OLSKTaskShouldBePerformed returns false', function(done) {
		var item = Object.assign(taskObjectValid(), {
			OLSKTaskShouldBePerformed: function() {
				return false;
			},
		});

		mod.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			deepEqual(item._OLSKTestingData.length, 0);

			done();
		}, delayForFireCount(2.5));
	});

	it('increments _OLSKTaskFireCount after each callback fired', function(done) {
		var item = taskObjectValid();

		mod.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			deepEqual(item._OLSKTaskFireCount, 4);

			done();
		}, delayForFireCount(4.7));
	});

	it('sets OLSKTaskStartedAt before firing callback for the first time', function(done) {
		var item = taskObjectValid();

		var startDate = new Date();
		mod.OLSKTasksTimeoutForTaskObject(item);

		setTimeout(function() {
			clearInterval(item._OLSKTaskTimerID);

			deepEqual(datesEqualWithinThreshold(item.OLSKTaskStartedAt, startDate, 15), true);

			done();
		}, delayForFireCount(4.5));
	});

	context('OLSKTaskFiresImmediately', function() {

		it('fires immediately if true', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFiresImmediately: true,
			});

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				deepEqual(item._OLSKTestingData.length, 3);

				done();
			}, delayForFireCount(2.5));
		});

	});

	context('OLSKTaskFireLimit', function() {

		it('limits callback fire count', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: 3,
			});

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				deepEqual(item._OLSKTestingData.length, 3);

				done();
			}, delayForFireCount(4.5));
		});

		it('sets OLSKTaskStoppedAt after firing callback for the last time', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireLimit: 3,
			});

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearInterval(item._OLSKTaskTimerID);

				deepEqual(datesEqualWithinThreshold(item.OLSKTaskStoppedAt, new Date(), 15), true);

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

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				deepEqual(item._OLSKTestingData.length, 0);

				done();
			}, delayForFireCount(2.5));
		});

		it('fires callback at first fire date', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(3))
				],
			});

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				deepEqual(item._OLSKTestingData.length, 1);

				done();
			}, delayForFireCount(3.5));
		});

		it('can be stopped via clearTimeout', function(done) {
			var item = Object.assign(taskObjectValid(), {
				OLSKTaskFireDates: [
					new Date((new Date()).valueOf() + delayForFireCount(2))
				],
			});

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				clearTimeout(item._OLSKTaskTimerID);

				setTimeout(function() {
					deepEqual(item._OLSKTestingData.length, 0);

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

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				deepEqual(item._OLSKTestingData.length, 2);

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

			mod.OLSKTasksTimeoutForTaskObject(item);

			setTimeout(function() {
				deepEqual(datesEqualWithinThreshold(item.OLSKTaskStoppedAt, new Date(), 15), true);

				done();
			}, delayForFireCount(4.2));
		});

	});

});
