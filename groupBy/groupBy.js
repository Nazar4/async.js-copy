const { parallelMapLimit } = require('../map/map');
const { toPromise, wrapAsync } = require('../util-async');

function parallelGroupBy(coll, iteratee, callback) {
  if (callback) {
    groupBy(parallelMapLimit, Infinity, coll, iteratee, callback);
  } else {
    return toPromise(
      groupBy,
      parallelMapLimit,
      Infinity,
      coll,
      iteratee,
      callback
    );
  }
}

function seriesGroupBy(coll, iteratee, callback) {
  if (callback) {
    groupBy(parallelMapLimit, 1, coll, iteratee, callback);
  } else {
    return toPromise(groupBy, parallelMapLimit, 1, coll, iteratee, callback);
  }
}

function parallelGroupByLimit(coll, limit, iteratee, callback) {
  if (callback) {
    groupBy(parallelMapLimit, limit, coll, iteratee, callback);
  } else {
    return toPromise(
      groupBy,
      parallelMapLimit,
      limit,
      coll,
      iteratee,
      callback
    );
  }
}

function groupBy(mapfn, limit, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const result = {};
  const { hasOwnProperty } = Object.prototype;

  return mapfn(
    coll,
    limit,
    (value, iterationCallback) => {
      _iteratee(value, (err, key) => {
        if (err) return iterationCallback(err);
        return iterationCallback(err, { key, value });
      });
    },
    (err, mappedResults) => {
      for (let i = 0; i < mappedResults.length; i++) {
        if (mappedResults[i]) {
          const { key, value } = mappedResults[i];
          if (hasOwnProperty.call(result, key)) {
            result[key].push(value);
          } else {
            result[key] = [value];
          }
        }
      }
      return callback(err, result);
    }
  );
}

module.exports = { parallelGroupBy, seriesGroupBy, parallelGroupByLimit };
