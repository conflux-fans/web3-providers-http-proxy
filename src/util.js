function setNull(object, keys) {
  for (let key of keys) {
    object[key] = null;
  }
}

function delKeys(object, keys) {
  for (let key of keys) {
    delete object[key];
  }
}

module.exports = {
  emptyFn: origin => origin,

  asyncEmptyFn: async origin => origin,

  numToHex: num => `0x${num.toString(16)}`,

  setNull,
  
  delKeys
};
