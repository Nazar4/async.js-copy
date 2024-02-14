function isAsync(fn) {
  return fn[Symbol.toStringTag] === 'AsyncFunction';
}

function toPromise(fn, ...args) {
  return new Promise((resolve, reject) => {
    args.pop();
    fn.apply(null, [
      ...args,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    ]);
  });
}

function promiseCallback(callback) {
  return new Promise((resolve, reject) => {
    fn.apply(null, [
      ...args,
      (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      }
    ]);
  });
}

function executeFunctionOnlyOnce(fn) {
  return function (...args) {
    if (fn === null) throw new Error('Callback was already called.');
    var callFn = fn;
    fn = null;
    callFn.apply(this, args);
  };
}

function wrapAsync(asyncFn) {
  if (typeof asyncFn !== 'function') throw new Error('expected a function');
  return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
}

function initialParams(fn) {
  return function (...args) {
    var callback = args.pop();
    return fn.call(this, args, callback);
  };
}

function asyncify(func) {
  if (isAsync(func)) {
    return function (...args) {
      const callback = args.pop();
      const promise = func.apply(this, args);
      return handlePromise(promise, callback);
    };
  }

  return initialParams(function (args, callback) {
    var result;
    try {
      result = func.apply(this, args);
    } catch (e) {
      return callback(e);
    }
    // if result is Promise object
    if (result && typeof result.then === 'function') {
      return handlePromise(result, callback);
    } else {
      callback(null, result);
    }
  });
}

function handlePromise(promise, callback) {
  return promise.then(
    (value) => {
      invokeCallback(callback, null, value);
    },
    (err) => {
      invokeCallback(
        callback,
        err && (err instanceof Error || err.message) ? err : new Error(err)
      );
    }
  );
}

function invokeCallback(callback, error, value) {
  try {
    callback(error, value);
  } catch (err) {
    setImmediate((e) => {
      throw e;
    }, err);
  }
}

function isArrayOrArrayLike(obj) {
  return (
    Array.isArray(obj) ||
    (obj != null &&
      typeof obj === 'object' &&
      typeof obj.length === 'number' &&
      obj.length >= 0 &&
      (obj.length === 0 || (obj.length > 0 && obj.length - 1 in obj)))
  );
}

function isArrayLike(obj) {
  return (
    obj != null &&
    typeof obj === 'object' &&
    typeof obj.length === 'number' &&
    obj.length >= 0 &&
    (obj.length === 0 || (obj.length > 0 && obj.length - 1 in obj))
  );
}

function asyncApply(...args) {
  if (!args) return;

  const fn = args.shift();

  if (typeof fn !== 'function') {
    throw new Error('First argument has to be a function');
  }

  return (...newArgs) => fn.apply(null, [...args, ...newArgs]);
}

const breakLoop = {};

module.exports = {
  wrapAsync,
  asyncify,
  toPromise,
  executeFunctionOnlyOnce,
  isArrayOrArrayLike,
  isArrayLike,
  asyncApply,
  breakLoop
};
