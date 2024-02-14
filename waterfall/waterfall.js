const asyncReduce = require('../reduce/reduce');

function asyncWaterfall(tasks, callback) {
  tasks = tasks || [];

  let resolve, reject;
  if (!callback) {
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
    tasks,
    [],
    (newargs, fn, iterCb) => {
      if (typeof fn !== 'function') throw new Error('expected a function');
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
}

module.exports = { asyncWaterfall };
