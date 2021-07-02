const Adaptor = require('../JsonRPCAdaptor');

/**
 * eth method: eth_getTransactionByBlockHashAndIndex
 * cfx method: cfx_getBlockByHash
 * 
 * inputs example:
 * 
 * outputs example:
 */
 async function inputAdaptor(params) {
  this.txIndex = params[1];
  params[1] = true;
}

async function outputAdaptor(response) {
  if (!response || !response.result) return;
  let index = Number(this.txIndex);
  response.result = response.result.transactions[index];
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);

