const { toPromise, wrapAsync, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelSort(coll, iteratee, callback) {
  if (callback) {
    sort(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      sort,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesSort(coll, iteratee, callback) {
  if (callback) {
    sort(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      sort,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelSortLimit(coll, limit, iteratee, callback) {
  if (callback) {
    sort(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      sort,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function sort(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = new Map();

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(value, (err, v) => {
        results.set(value, v);
        iterationCallback(err);
      });
    },
    (err) => {
      return callback(
        err,
        [...results.entries()]
          .sort(([_, v1], [__, v2]) => v2 - v1)
          .map(([key]) => key)
      );
    }
  );
}

module.exports = { parallelSort, seriesSort, parallelSortLimit };
