const { iterator } = require('../iterator');
const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce,
  iterateeWithValue
} = require('../util-async');

const parallelEach = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(Infinity)(
      coll,
      iterateeWithValue(iteratee),
      callback
    );
  } else {
    return toPromise(
      parallelEachLimitCallback(Infinity),
      coll,
      iterateeWithValue(iteratee),
      callback
    );
  }
};

const seriesEach = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(1)(coll, iterateeWithValue(iteratee), callback);
  } else {
    return toPromise(
      parallelEachLimitCallback(1),
      coll,
      iterateeWithValue(iteratee),
      callback
    );
  }
};

function parallelEachLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelEachLimitCallback(limit)(
      coll,
      iterateeWithValue(iteratee),
      callback
    );
  } else {
    return toPromise(
      parallelEachLimitCallback(limit),
      coll,
      iterateeWithValue(iteratee),
      callback
    );
  }
}

function parallelEachLimitCallback(limit) {
  return (coll, iteratee, callback) => {
    if (limit <= 0) {
      throw new RangeError('concurrency limit cannot be less than 1');
    }
    if (!coll || coll.length === 0) {
      return callback(null);
    }
    let nextElem = iterator(coll),
      canceled = false,
      running = 0,
      looping = false,
      done = false;
    const _iteratee = wrapAsync(iteratee);
    const _callback = executeFunctionOnlyOnce(callback);

    function iterateeCallback(err, value) {
      if (canceled) return;
      running -= 1;
      if (err) {
        done = true;
        canceled = true;
        _callback(err);
      } else if (done && running <= 0) {
        done = true;
        _callback(null);
      } else if (!looping) {
        processItems();
      }
    }
    function processItems() {
      looping = true;
      while (running < limit && !done) {
        let item = nextElem();
        if (item === null) {
          done = true;
          if (running <= 0) {
            _callback(null);
          }
          return;
        }
        running += 1;
        _iteratee(item, executeFunctionOnlyOnce(iterateeCallback));
      }
      looping = false;
    }
    processItems();
  };
}

module.exports = {
  parallelEach,
  parallelEachLimit,
  seriesEach,
  parallelEachLimitCallback
};
