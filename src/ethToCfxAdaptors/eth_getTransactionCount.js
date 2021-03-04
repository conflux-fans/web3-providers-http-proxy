const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getTransactionCount
 * cfx method: cfx_getNextNonce
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */

async function inputAdaptor(params) {
    params[0] = format.formatAddress(params[0], this.cfx.networkId);
    format.formatEpochOfParams(params, 1);
}

module.exports = new Adaptor(inputAdaptor);
