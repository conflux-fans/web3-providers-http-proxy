const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');

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
    params[0] = await format.formatTxParams(this.cfx, params[0]);
  }
}

module.exports = new Adaptor(inputAdaptor);
