const { toPromise, breakLoop, isArrayOrArrayLike } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncTryEach(coll, callback) {
  if (callback) {
    tryEach(parallelEachLimitCallback(1), coll, callback);
  } else {
    return toPromise(tryEach, parallelEachLimitCallback(1), coll, callback);
  }
}

function tryEach(eachfn, tasks, callback) {
  tasks = tasks || [];
  let result;
  let error;

  return eachfn(
    tasks,
    (task, _, iterCb) => {
      if (typeof task !== 'function') throw new Error('expected a function');
      task.call(null, (err, ...args) => {
        error = err;
        result = args.length > 1 ? args : args[0];
        if (!err) {
          return iterCb(err, breakLoop);
        }
        iterCb();
      });
    },
    () => callback(error, result)
  );
}

module.exports = { asyncTryEach };
