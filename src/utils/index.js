const _ = require('lodash');
const assert = require('assert');

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

function buildJsonRpcRequest(method, ...params) {
  return {
    "jsonrpc": "2.0",
    "id": Date.now().toString(),
    method,
    params,
  }
}

function isHex(str) {
  assert(_.isString(str), "required a string");
  assert(str.startsWith('0x') || str.startsWith('0X'));
}

function isHexOrNull(str) {
  if (!str) return;
  isHex(str);
}

module.exports = {
  emptyFn: origin => origin,

  asyncEmptyFn: async origin => origin,

  numToHex: num => `0x${num.toString(16)}`,

  setNull,
  
  delKeys,

  buildJsonRpcRequest,

  isHexOrNull,

  isHex,
};
