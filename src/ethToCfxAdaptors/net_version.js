const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
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
    if (response && response.result && response.result.networkId) {
        response.result = Number.parseInt(response.result.networkId);
    }
    return response;
}

module.exports = new Adaptor(util.asyncEmptyFn, outputAdaptor);
