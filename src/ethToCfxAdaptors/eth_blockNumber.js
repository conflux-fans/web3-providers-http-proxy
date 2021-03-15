const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');

/**
 * eth method: eth_blockNumber
 * cfx method: cfx_epochNumber
 * 
 * inputs example:
 * 
 * outputs example:
 {
  "id":83,
  "jsonrpc": "2.0",
  "result": "0x4b7" // 1207
 }
 */
async function inputAdaptor(params) {
  format.formatEpochOfParams(params, 0);
  // set default parameter
  if(params.length === 0) {
    params[0] = 'latest_state';
  }
}

module.exports = new Adaptor(inputAdaptor);