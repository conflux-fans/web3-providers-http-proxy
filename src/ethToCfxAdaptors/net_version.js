const Adaptor = require('../JsonRPCAdaptor');
const util = require('../util');

/**
 * eth method: net_version
 * cfx method: cfx_status
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */
async function outputAdaptor(response) {
  if (!response || !response.result) return;
  response.result = response.result.networkId;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
