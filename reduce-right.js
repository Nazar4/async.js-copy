const {
  toPromise,
  wrapAsync,
  executeFunctionOnlyOnce,
  isArrayOrArrayLike
} = require('./util-async');

function asyncReduceRight(array, memo, iteratee, callback) {
  if (callback) {
    asyncReduceRightCallback(array, memo, iteratee, callback);
  } else {
    return toPromise(asyncReduceRightCallback, array, memo, iteratee, callback);
  }
}

const asyncReduceRightCallback = (array, memo, iteratee, callback) => {
  if (!isArrayOrArrayLike(array))
    throw new TypeError('First argument has to be Array or ArrayLike object');
  array = array || [];
  let result = memo;
  let index = array.length;
  const _iteratee = wrapAsync(iteratee);
  const _callback = executeFunctionOnlyOnce(callback);

  function eachOf() {
    if (--index >= 0) {
      _iteratee(result, array[index], (err, value) => {
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

module.exports = asyncReduceRight;
