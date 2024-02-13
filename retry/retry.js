const { wrapAsync } = require('../util-async');

function asyncRetry(opts = { times: 5, interval: 0 }, task, callback) {
  const options = {
    times: 5,
    interval: 0
  };
  let resolve, reject;

  if (arguments.length < 3 && typeof opts === 'function') {
    callback =
      task ||
      function (err, ...args) {
        if (err) return reject(err);
        resolve(args.length === 1 ? args[0] : args);
      };
    task = opts;
  } else {
    if (typeof opts !== 'object') {
      options.times = +opts || options.times;
    } else {
      options.times = +opts.times || options.times;
      options.interval =
        typeof opts.interval === 'function'
          ? opts.interval
          : +opts.interval || options.interval;
      options.errorFilter = opts?.errorFilter;
    }
    callback =
      callback ||
      function (err, ...args) {
        if (err) return reject(err);
        resolve(args.length === 1 ? args[0] : args);
      };
  }

  callback.promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  const _task = wrapAsync(task);

  let attempt = 1;
  function retryAttempt() {
    _task((err, ...args) => {
      if (
        err &&
        attempt++ < options.times &&
        (typeof options.errorFilter !== 'function' || options.errorFilter(err))
      ) {
        setTimeout(
          retryAttempt,
          typeof options.interval === 'function'
            ? options.interval(attempt - 1)
            : options.interval
        );
      } else {
        callback(err, ...args);
      }
    });
  }

  retryAttempt();
  return callback.promise;
}

module.exports = { asyncRetry };
