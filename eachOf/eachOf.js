const { parallelEachLimitCallback } = require('../each/each');
const { iterator } = require('../iterator');
const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('../util-async');

const parallelEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(Infinity)(coll, iteratee, callback);
  } else {
    return toPromise(
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
};

const seriesEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(1)(coll, iteratee, callback);
  } else {
    return toPromise(parallelEachLimitCallback(1), coll, iteratee, callback);
  }
};

function parallelEachOfLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelEachLimitCallback(limit)(coll, iteratee, callback);
  } else {
    return toPromise(
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

module.exports = { parallelEachOf, parallelEachOfLimit, seriesEachOf };
