const Adaptor = require('../JsonRPCAdaptor');
const util = require('../util');

/**
 * eth method: 
 * cfx method:
 * 
 * inputs example:
 * 
 * outputs example:
 {
  "id": 83,
  "jsonrpc": "2.0",
  "result": "0x3d" // 61
}
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result = response.result.chainId;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
