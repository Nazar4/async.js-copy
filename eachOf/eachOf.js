const { iterator } = require('../iterator');
const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('../util-async');

const parallelEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachOfLimitCallback(Infinity)(coll, iteratee, callback);
  } else {
    return toPromise(
      parallelEachOfLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
};

const seriesEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachOfLimitCallback(1)(coll, iteratee, callback);
  } else {
    return toPromise(parallelEachOfLimitCallback(1), coll, iteratee, callback);
  }
};

function parallelEachOfLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelEachOfLimitCallback(limit)(coll, iteratee, callback);
  } else {
    return toPromise(
      parallelEachOfLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelEachOfLimitCallback(limit) {
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
        var item = nextElem();
        if (item === null) {
          done = true;
          if (running <= 0) {
            _callback(null);
          }
          return;
        }
        running += 1;
        _iteratee(
          item.value,
          item.key,
          executeFunctionOnlyOnce(iterateeCallback)
        );
      }
      looping = false;
    }
    processItems();
  };
}

module.exports = { parallelEachOf, parallelEachOfLimit, seriesEachOf };
