const Adaptor = require('../JsonRPCAdaptor');
const util = require('../util');

/**
 * eth method: eth_getBlockTransactionCountByNumber
 * cfx method: cfx_getBlockByEpochNumber
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

