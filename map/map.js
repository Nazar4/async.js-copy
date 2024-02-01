const { toPromise, wrapAsync, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelMap(coll, iteratee, callback) {
  if (callback) {
    map(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      map,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesMap(coll, iteratee, callback) {
  if (callback) {
    map(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      map,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelMapLimit(coll, limit, iteratee, callback) {
  if (callback) {
    map(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      map,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function map(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = [];
  let counter = 0;

  return eachfn(
    coll,
    (value, index, iterationCallback) => {
      var index = counter++;
      _iteratee(value, (err, transformedValue) => {
        results[index] = transformedValue;
        iterationCallback(err);
      });
    },
    (err) => {
      callback(err, results);
    }
  );
}

module.exports = { parallelMap, seriesMap, parallelMapLimit };
