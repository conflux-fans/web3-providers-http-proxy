const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getCode
 * cfx method: cfx_getCode
 * 
 * inputs example:
 * 
 * outputs example:
 {
  "id":1,
  "jsonrpc": "2.0",
  "result": "0x600160008035811a818181146012578301005b601b6001356025565b8060005260206000f25b600060078202905091905056"
}
 */

async function inputAdaptor(params) {
  params[0] = format.formatAddress(params[0], this.cfx.networkId);
  format.formatEpochOfParams(params, 1);
}

async function outputAdaptor(response) {
  if (response && response.error && response.error.code == -32016) {
    response.error = null;
    response.result = "0x";
  }
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);
