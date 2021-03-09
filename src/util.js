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

module.exports = {
  emptyFn: origin => origin,

  asyncEmptyFn: async origin => origin,

  numToHex: num => `0x${num.toString(16)}`,

  setNull,
  
  delKeys,

  buildJsonRpcRequest
};
