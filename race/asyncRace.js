const { toPromise, breakLoop } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function asyncRace(coll, callback) {
  if (callback) {
    race(parallelEachLimitCallback(Infinity), coll, callback);
  } else {
    return toPromise(race, parallelEachLimitCallback(Infinity), coll, callback);
  }
}

function race(eachfn, coll, callback) {
  coll = coll || [];
  let result;

  return eachfn(
    coll,
    (task, _, iterCb) => {
      if (typeof task !== 'function') throw new Error('expected a function');
      task.call(null, (err, value) => {
        result = value;
        return iterCb(err, breakLoop);
      });
    },
    (err) => callback(err, result)
  );
}

module.exports = { asyncRace };
