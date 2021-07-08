const { ethers } = require("ethers");

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

function buildJsonRpcPayload(method, ...params) {
  return {
    "jsonrpc": "2.0",
    "id": Date.now().toString(),
    method,
    params,
  }
}

module.exports = {
  emptyFN: origin => origin,

  asyncEmptyFN: async origin => origin,

  setNull,
  
  delKeys,

  buildJsonRpcPayload,

  numToHex: ethers.utils.hexValue,

  isHex: ethers.utils.isHexString,
};
