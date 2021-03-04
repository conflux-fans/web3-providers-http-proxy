const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');

/**
 * eth method: eth_getBalance
 * cfx method: cfx_getBalance
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
