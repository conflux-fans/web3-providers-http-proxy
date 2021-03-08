const Adaptor = require('../JsonRPCAdaptor');
const util = require('../util');

/**
 * eth method: eth_getBlockTransactionCountByHash
 * cfx method: cfx_getBlockByHash
 * 
 * inputs example:
 * 
 * outputs example:
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result = response.result.transactions.length;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);

