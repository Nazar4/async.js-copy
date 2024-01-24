const { isArrayLike } = require('./util-async');

function getIterator(coll) {
  return coll[Symbol.iterator] && coll[Symbol.iterator]();
}

function createArrayIterator(coll) {
  let i = -1,
    { length } = coll;
  return function next() {
    return ++i < length ? { value: coll[i], key: i } : null;
  };
}

function createObjectIterator(obj) {
  const keys = obj ? Object.keys(obj) : [];
  let i = -1,
    length = keys.length;
  return function next() {
    var key = keys[++i];
    if (key === '__proto__') {
      return next();
    }
    return i < length ? { value: obj[key], key } : null;
  };
}

function createES2015Iterator(iterator) {
  let i = -1;
  return function next() {
    const elem = iterator.next();
    if (elem.done) {
      return null;
    }
    i++;
    return { value: elem.value, key: i };
  };
}

function createIterator(coll) {
  if (isArrayLike(coll)) {
    return createArrayIterator(coll);
  }

  var iterator = getIterator(coll);
  return iterator ? createES2015Iterator(iterator) : createObjectIterator(coll);
}

module.exports = { iterator: createIterator };
