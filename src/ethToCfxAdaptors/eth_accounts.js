const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_accounts
 * cfx method: accounts
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 {
  "id":1,
  "jsonrpc": "2.0",
  "result": ["0x407d73d8a49eeb85d32cf465507dd71d507100c1"]
 }
 * 
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result = response.result.map(format.formatHexAddress);
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
