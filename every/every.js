const { toPromise, wrapAsync, breakLoop } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelEvery(coll, iteratee, callback) {
  if (callback) {
    every(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      every,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesEvery(coll, iteratee, callback) {
  if (callback) {
    every(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      every,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelEveryLimit(coll, limit, iteratee, callback) {
  if (callback) {
    every(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      every,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function every(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  let result = true;

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(value, (err, value) => {
        if (err) return iterationCallback(err);

        if (!value) {
          result = false;
          return iterationCallback(null, breakLoop);
        }

        iterationCallback();
      });
    },
    (err) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
}

module.exports = { parallelEvery, seriesEvery, parallelEveryLimit };
