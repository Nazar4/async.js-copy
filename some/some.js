const { toPromise, wrapAsync, breakLoop } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelSome(coll, iteratee, callback) {
  if (callback) {
    some(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      some,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesSome(coll, iteratee, callback) {
  if (callback) {
    some(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      some,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelSomeLimit(coll, limit, iteratee, callback) {
  if (callback) {
    some(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      some,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function some(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  let result = false;

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(value, (err, value) => {
        if (err) return iterationCallback(err);

        if (value) {
          result = true;
          return iterationCallback(null, breakLoop);
        }

        iterationCallback();
      });
    },
    (err) => {
      if (err) return callback(err);
      callback(null, result);
    }
  );
}

module.exports = { parallelSome, seriesSome, parallelSomeLimit };
