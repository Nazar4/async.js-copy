const parallelMapLimit = require('./map-limit');
const {
  wrapAsync,
  toPromise,
  executeFunctionOnlyOnce
} = require('./util-async');

const seriesMap = (coll, iteratee, callback) => {
  if (callback) {
    seriesMapCallback(coll, iteratee, callback);
  } else {
    return toPromise(seriesMapCallback, coll, iteratee, callback);
  }
};

const seriesMapCallback = (coll, iteratee, callback) => {
  coll = coll || [];
  const results = [];
  let index = 0;
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);

  function eachMap() {
    if (index < coll.length) {
      _iteratee(coll[index], (err, value) => {
        results[index++] = value;
        if (err) {
          _callback(err, results);
          return;
        }
        eachMap();
      });
    } else {
      _callback(null, results);
    }
  }

  eachMap();
};

const parallelMap = (coll, iteratee, callback) => {
  if (callback) {
    parallelMapCallback(coll, iteratee, callback);
  } else {
    return toPromise(parallelMapCallback, coll, iteratee, callback);
  }
};

const parallelMapCallback = (coll, iteratee, callback) => {
  return parallelMapLimit(coll, Infinity, iteratee, callback);
};

module.exports = { parallelMap, seriesMap };
