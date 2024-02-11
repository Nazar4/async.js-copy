const asyncReduce = require('../reduce/reduce');

function asyncCompose(...fns) {
  return function (...args) {
    var callback = args[args.length - 1],
      resolve,
      reject;
    if (typeof callback === 'function') {
      args.pop();
    } else {
      callback = (err, ...args) => {
        if (err) return reject(err);
        resolve(args.length === 1 ? args[0] : args);
      };
      callback.promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
      });
    }

    asyncReduce(
      [...fns.reverse()],
      args,
      (newargs, fn, iterCb) => {
        fn.apply(
          this,
          newargs.concat((err, ...nextargs) => {
            iterCb(err, nextargs);
          })
        );
      },
      (err, results) => callback(err, ...results)
    );

    return callback.promise;
  };
}

module.exports = { asyncCompose };
