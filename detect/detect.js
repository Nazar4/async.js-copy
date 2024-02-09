const { toPromise, wrapAsync, breakLoop } = require('../util-async');
const { parallelEachLimitCallback } = require('../each/each');

function parallelDetect(coll, iteratee, callback) {
  if (callback) {
    detect(parallelEachLimitCallback(Infinity), coll, iteratee, callback);
  } else {
    return toPromise(
      detect,
      parallelEachLimitCallback(Infinity),
      coll,
      iteratee,
      callback
    );
  }
}

function seriesDetect(coll, iteratee, callback) {
  if (callback) {
    detect(parallelEachLimitCallback(1), coll, iteratee, callback);
  } else {
    return toPromise(
      detect,
      parallelEachLimitCallback(1),
      coll,
      iteratee,
      callback
    );
  }
}

function parallelDetectLimit(coll, limit, iteratee, callback) {
  if (callback) {
    detect(parallelEachLimitCallback(limit), coll, iteratee, callback);
  } else {
    return toPromise(
      detect,
      parallelEachLimitCallback(limit),
      coll,
      iteratee,
      callback
    );
  }
}

function detect(eachfn, coll, iteratee, callback) {
  coll = coll || [];
  const _iteratee = wrapAsync(iteratee);
  let result;

  return eachfn(
    coll,
    (value, _, iterationCallback) => {
      _iteratee(value, (err, v) => {
        if (err) return iterationCallback(err);

        if (v) {
          result = value;
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

module.exports = { parallelDetect, seriesDetect, parallelDetectLimit };
