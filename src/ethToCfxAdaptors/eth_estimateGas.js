const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');

/**
 * eth method: 
 * cfx method:
 * 
 * inputs example:
 * 
 * outputs example:
 {
  "id":1,
  "jsonrpc": "2.0",
  "result": "0x5208" // 21000
}
 */

async function inputAdaptor(params) {
  format.formatCommonInput(params, this.cfx.networkId);
}

async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result = response.result.gasUsed;
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);
