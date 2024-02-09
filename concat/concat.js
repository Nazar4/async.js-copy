const { seriesMap } = require('./map');
const parallelMapLimit = require('./map-limit');
const { toPromise } = require('../util-async');

const parallelConcat = (coll, iteratee, callback) => {
  if (callback) {
    parallelConcatCallback(coll, iteratee, callback);
  } else {
    return toPromise(parallelConcatCallback, coll, iteratee, callback);
  }
};

const parallelConcatLimit = (coll, limit, iteratee, callback) => {
  if (callback) {
    parallelConcatLimitCallback(coll, limit, iteratee, callback);
  } else {
    return toPromise(
      parallelConcatLimitCallback,
      coll,
      limit,
      iteratee,
      callback
    );
  }
};

const seriesConcat = (coll, iteratee, callback) => {
  return seriesMap(coll, iteratee, concatResultsFromCallback(callback));
};

const parallelConcatCallback = (coll, iteratee, callback) => {
  return parallelMapLimit(
    coll,
    Infinity,
    iteratee,
    concatResultsFromCallback(callback)
  );
};

const parallelConcatLimitCallback = (coll, limit, iteratee, callback) => {
  return parallelMapLimit(
    coll,
    limit,
    iteratee,
    concatResultsFromCallback(callback)
  );
};

function concatResultsFromCallback(callback) {
  return (err, results) => {
    const result = [];
    for (let i = 0; i < results.length; i++) {
      if (results[i]) result.push(...results[i]);
    }
    return callback(err, result);
  };
}

module.exports = { parallelConcat, parallelConcatLimit, seriesConcat };
