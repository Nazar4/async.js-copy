const { toPromise, breakLoop, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncParallel(coll, callback) {
  var parallel = isArrayOrArrayLike(coll) ? parallelArray : parallelObject;
  if (callback) {
    parallel(parallelEachLimitCallback(Infinity), coll, callback);
  } else {
    return toPromise(
      parallel,
      parallelEachLimitCallback(Infinity),
      coll,
      callback
    );
  }
}

function asyncParallelLimit(coll, limit, callback) {
  var parallel = isArrayOrArrayLike(coll) ? parallelArray : parallelObject;
  if (callback) {
    parallel(parallelEachLimitCallback(limit), coll, callback);
  } else {
    return toPromise(
      parallel,
      parallelEachLimitCallback(limit),
      coll,
      callback
    );
  }
}

function parallelArray(eachfn, coll, callback) {
  coll = coll || [];
  let result = new Array(coll.length);

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

function parallelObject(eachfn, obj, callback) {
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

module.exports = { asyncParallel, asyncParallelLimit };
