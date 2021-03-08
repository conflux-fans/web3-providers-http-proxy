const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_sendTransaction
 * cfx method: cfx_sendTransaction
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */

async function inputAdaptor(params) {
  if (params.length > 0) {
    params[0] = await format.formatTxParams(this.cfx, params[0]);  // TODO deal the cfx
  }
}

module.exports = new Adaptor(inputAdaptor);
