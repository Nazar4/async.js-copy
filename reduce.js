const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce
} = require('./util-async');

function asyncReduce(coll, memo, iteratee, callback) {
  if (callback) {
    asyncReduceCallback(coll, memo, iteratee, callback);
  } else {
    return toPromise(asyncReduceCallback, coll, memo, iteratee, callback);
  }
}

const asyncReduceCallback = (coll, memo, iteratee, callback) => {
  coll = coll || [];
  let result = memo;
  let index = -1;
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);

  function eachOf() {
    if (++index < coll.length) {
      _iteratee(result, coll[index], (err, value) => {
        result = value;
        if (err) {
          _callback(err, result);
          return;
        }
        eachOf();
      });
    } else {
      _callback(null, result);
    }
  }

  eachOf();
};

module.exports = asyncReduce;
