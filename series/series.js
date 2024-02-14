const { toPromise, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncSeries(coll, callback) {
  var series = isArrayOrArrayLike(coll) ? seriesArray : seriesObject;
  if (callback) {
    series(parallelEachLimitCallback(1), coll, callback);
  } else {
    return toPromise(series, parallelEachLimitCallback(1), coll, callback);
  }
}

function seriesArray(eachfn, coll, callback) {
  coll = coll || [];
  let result = [];

  return eachfn(
    coll,
    (task, index, iterCb) => {
      if (typeof task !== 'function') throw new Error('expected a function');
      task.call(null, (err, v) => {
        if (v) {
          result[index] = v;
        }
        if (err) return iterCb(err);
        iterCb();
      });
    },
    (err) => callback(err, result)
  );
}

function seriesObject(eachfn, obj, callback) {
  obj = obj || {};
  let result = {};

  return eachfn(
    obj,
    (task, key, iterCb) => {
      if (typeof task !== 'function') throw new Error('expected a function');
      task.call(null, (err, v) => {
        if (v) {
          result[key] = v;
        }
        if (err) return iterCb(err);
        iterCb();
      });
    },
    (err) => callback(err, result)
  );
}

module.exports = { asyncSeries };
