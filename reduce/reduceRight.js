const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncReduceRight(coll, memo, iteratee, callback) {
  if (callback) {
    reduceRight(parallelEachLimitCallback(1), coll, memo, iteratee, callback);
  } else {
    return toPromise(
      reduceRight,
      parallelEachLimitCallback(1),
      coll,
      memo,
      iteratee,
      callback
    );
  }
}

function reduceRight(eachfn, coll, memo, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);
  let result = memo;

  return eachfn(
    [...coll].reverse(),
    (value, _, iterationCallback) => {
      _iteratee(result, value, (err, v) => {
        console.log(v);
        result = v;
        return iterationCallback(err);
      });
    },
    (err) => _callback(err, result)
  );
}

module.exports = asyncReduceRight;
