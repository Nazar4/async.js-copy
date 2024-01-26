const { iterator } = require('../iterator');
const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce,
  breakLoop
} = require('../util-async');

const parallelEach = (coll, iteratee, callback) => {
  if (callback) {
    each(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      each,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
};

const seriesEach = (coll, iteratee, callback) => {
  if (callback) {
    each(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      each,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
};

function parallelEachLimit(coll, limit, iteratee, callback) {
  if (callback) {
    each(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      each,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
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
      } else if (value === breakLoop || (done && running <= 0)) {
        done = true;
        canceled = true;
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

function each(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(value, (err) => {
        if (err) return iterationCallback(err);

        iterationCallback();
      });
    },
    (err) => {
      if (err) return callback(err);
      callback(null);
    }
  );
}

module.exports = {
  parallelEach,
  parallelEachLimit,
  seriesEach,
  parallelEachLimitCallback
};
