const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('./util-async');

function parallelMapLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelMapLimitCallback(coll, limit, iteratee, callback);
  } else {
    return toPromise(parallelMapLimitCallback, coll, limit, iteratee, callback);
  }
}

function parallelMapLimitCallback(coll, limit, iteratee, callback) {
  if (limit <= 0) {
    throw new RangeError('concurrency limit cannot be less than 1');
  }
  if (!coll || coll.length === 0) {
    return callback(null, []);
  }
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);
  const results = [];
  let taskIndex = -1,
    canceled = false,
    taskFinishedCounter = 0,
    tasksBandwidth = limit;

  function processNextTasks() {
    while (tasksBandwidth-- > 0 && ++taskIndex < coll.length) {
      const index = taskIndex;
      const currentLimit = tasksBandwidth;
      _iteratee(coll[taskIndex], (err, value) => {
        results[index] = value;
        if (err) {
          _callback(err, results);
          canceled = true;
          return;
        }
        if (++taskFinishedCounter === coll.length && !canceled) {
          _callback(null, results);
          return;
        }
        if (currentLimit === 0) {
          tasksBandwidth = limit;
          processNextTasks();
        }
      });
    }
  }
  processNextTasks();
}

module.exports = parallelMapLimit;
