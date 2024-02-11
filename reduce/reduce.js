const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncReduce(coll, memo, iteratee, callback) {
  if (callback) {
    reduce(parallelEachLimitCallback(1), coll, memo, iteratee, callback);
  } else {
    return toPromise(
      reduce,
      parallelEachLimitCallback(1),
      coll,
      memo,
      iteratee,
      callback
    );
  }
}

function reduce(eachfn, coll, memo, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);
  let result = memo;

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(result, value, (err, v) => {
        result = v;
        return iterationCallback(err);
      });
    },
    (err) => _callback(err, result)
  );
}

module.exports = asyncReduce;
