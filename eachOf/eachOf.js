const { parallelEachLimitCallback } = require('../each/each');
const { iterator } = require('../iterator');
const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce,
  iterateeWithValueAndKey
} = require('../util-async');

const parallelEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(Infinity)(
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  } else {
    return toPromise(
      parallelEachLimitCallback(Infinity),
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  }
};

const seriesEachOf = (coll, iteratee, callback) => {
  if (callback) {
    parallelEachLimitCallback(1)(
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  } else {
    return toPromise(
      parallelEachLimitCallback(1),
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  }
};

function parallelEachOfLimit(coll, limit, iteratee, callback) {
  if (callback) {
    parallelEachLimitCallback(limit)(
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  } else {
    return toPromise(
      parallelEachLimitCallback(limit),
      coll,
      iterateeWithValueAndKey(iteratee),
      callback
    );
  }
}

module.exports = { parallelEachOf, parallelEachOfLimit, seriesEachOf };
