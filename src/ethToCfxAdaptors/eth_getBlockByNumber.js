const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');

/**
 * eth method: eth_getBlockByNumber
 * cfx method: cfx_getBlockByEpochNumber
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */

async function inputAdaptor(params) {
    format.formatEpochOfParams(params, 0);
}

async function outputAdaptor(response) {
    if (response && response.result) {
        format.formatBlock(response.result);
    }
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);
