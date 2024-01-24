const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('./util-async');

function parallelDetect(coll, iteratee, callback) {
  if (callback) {
    parallelDetectLimitCallback(coll, Infinity, iteratee, callback);
  } else {
    return toPromise(
      parallelDetectLimitCallback,
      coll,
      Infinity,
      iteratee,
      callback
    );
  }
}

const seriesDetect = (coll, iteratee, callback) => {
  if (callback) {
    seriesDetectCallback(coll, iteratee, callback);
  } else {
    return toPromise(seriesDetectCallback, coll, iteratee, callback);
  }
};

const seriesDetectCallback = (coll, iteratee, callback) => {
  coll = coll || [];
  let index = 0;
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);

  function eachDetect() {
    if (index < coll.length) {
      _iteratee(coll[index], (err, value) => {
        if (err) {
          _callback(err);
          return;
        }
        if (value) {
          _callback(null, coll[index]);
          return;
        }
        index += 1;
        eachDetect();
      });
    } else {
      _callback(null);
    }
  }

  eachDetect();
};

function parallelDetectLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelDetectLimitCallback(coll, limit, iteratee, callback);
  } else {
    return toPromise(
      parallelDetectLimitCallback,
      coll,
      limit,
      iteratee,
      callback
    );
  }
}

function parallelDetectLimitCallback(coll, limit, iteratee, callback) {
  if (limit <= 0) {
    throw new RangeError('concurrency limit cannot be less than 1');
  }
  if (!coll || coll.length === 0) {
    return callback(null, []);
  }
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);
  let taskIndex = -1,
    canceled = false,
    taskFinishedCounter = 0,
    tasksBandwidth = limit;

  function processNextTasks() {
    while (tasksBandwidth-- > 0 && ++taskIndex < coll.length) {
      const currentLimit = tasksBandwidth;
      const itemIndex = taskIndex;
      _iteratee(coll[taskIndex], (err, value) => {
        if (err) {
          _callback(err);
          canceled = true;
          return;
        }
        if (value && !canceled) {
          _callback(null, coll[itemIndex]);
          canceled = true;
          return;
        }
        if (++taskFinishedCounter === coll.length && !canceled) {
          _callback(null);
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

module.exports = { parallelDetectLimit, seriesDetect, parallelDetect };
