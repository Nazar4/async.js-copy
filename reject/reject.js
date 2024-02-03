const { toPromise, wrapAsync, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelReject(coll, iteratee, callback) {
  var reject = isArrayOrArrayLike(coll) ? rejectArray : rejectGeneric;
  if (callback) {
    reject(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      reject,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesReject(coll, iteratee, callback) {
  var reject = isArrayOrArrayLike(coll) ? rejectArray : rejectGeneric;
  if (callback) {
    reject(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      reject,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelRejectLimit(coll, limit, iteratee, callback) {
  var reject = isArrayOrArrayLike(coll) ? rejectArray : rejectGeneric;
  if (callback) {
    reject(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      reject,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function rejectArray(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = new Array(coll.length);

  return eachfn(
    coll,
    (value, index, iterationCallback) => {
      _iteratee(value, (err, truthValue) => {
        if (!truthValue) {
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

function rejectGeneric(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const results = [];
  const keys = Object.keys(coll);

  return eachfn(
    coll,
    (value, key, iterationCallback) => {
      _iteratee(value, (err, truthValue) => {
        if (!truthValue) {
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

module.exports = { parallelReject, seriesReject, parallelRejectLimit };
