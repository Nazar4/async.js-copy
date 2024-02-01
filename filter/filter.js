const { toPromise, wrapAsync, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelFilter(coll, iteratee, callback) {
  var filter = isArrayOrArrayLike(coll) ? filterArray : filterGeneric;
  if (callback) {
    filter(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      filter,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesFilter(coll, iteratee, callback) {
  var filter = isArrayOrArrayLike(coll) ? filterArray : filterGeneric;
  if (callback) {
    filter(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      filter,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelFilterLimit(coll, limit, iteratee, callback) {
  var filter = isArrayOrArrayLike(coll) ? filterArray : filterGeneric;
  if (callback) {
    filter(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      filter,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function filterArray(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = new Array(coll.length);

  return eachfn(
    coll,
    (value, index, iterationCallback) => {
      _iteratee(value, (err, truthValue) => {
        if (truthValue) {
          results[index] = value;
        }
        iterationCallback(err);
      });
    },
    (err) => {
      if (err) return callback(err);
      callback(
        null,
        results.filter((x) => x)
      );
    }
  );
}

function filterGeneric(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = [];
  const keys = Object.keys(coll);

  return eachfn(
    coll,
    (value, key, iterationCallback) => {
      _iteratee(value, (err, truthValue) => {
        if (truthValue) {
          results.push({ key, value });
        }
        iterationCallback(err);
      });
    },
    (err) => {
      if (err) return callback(err);
      const orderedResults = [];
      results.forEach((result) => {
        orderedResults[keys.indexOf(result.key)] = result.value;
      });
      callback(
        null,
        orderedResults.filter((x) => x)
      );
    }
  );
}

module.exports = { parallelFilter, seriesFilter, parallelFilterLimit };
