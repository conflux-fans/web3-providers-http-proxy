const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_call
 * cfx method: cfx_call
 * 
 * inputs example: object
    from: DATA, 20 Bytes - (optional) The address the transaction is sent from.
    to: DATA, 20 Bytes - The address the transaction is directed to.
    gas: QUANTITY
    gasPrice: QUANTITY
    value: QUANTITY
    data: DATA

 * outputs example:
 {
  "id":1,
  "jsonrpc": "2.0",
  "result": "0x"
 }
 */

async function inputAdaptor(params) {
    format.formatCommonInput(params, this.cfx.networkId);
}

module.exports = new Adaptor(inputAdaptor);
