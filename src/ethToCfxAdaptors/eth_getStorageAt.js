const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getStorageAt
 * cfx method: cfx_getStorageAt
 * 
 * inputs example:
 * 
 * outputs example:
 {
     "jsonrpc":"2.0",
     "id":1,
     "result":"0x00000000000000000000000000000000000000000000000000000000000004d2"
 }
 */
async function inputAdaptor(params) {
    format.formatEpochOfParams(params, 2);
}

module.exports = new Adaptor(inputAdaptor);
