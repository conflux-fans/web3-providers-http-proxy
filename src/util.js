const RLP = require('rlp');
const {format} = require('js-conflux-sdk');

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

function decodeEthRawTx(tx) {
  let [nonce, gasPrice, gas, to, value, data, v, r, s] = RLP.decode(tx);
  return {
    nonce: format.hex(nonce),
    gasPrice: format.hex(gasPrice),
    gas: format.hex(gas),
    to: format.hex(to),
    value: format.hex(value),
    data: format.hex(data),
    v: format.uInt(v), 
    r: format.hex(r),
    s: format.hex(s),
  };
}

module.exports = {
  emptyFn: origin => origin,

  asyncEmptyFn: async origin => origin,

  numToHex: num => `0x${num.toString(16)}`,

  setNull,
  
  delKeys,

  buildJsonRpcRequest,

  decodeEthRawTx,

  MAX_UINT64: '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
};
