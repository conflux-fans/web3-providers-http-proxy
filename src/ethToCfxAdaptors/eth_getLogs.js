const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');

/**
 * eth method: eth_getLogs
 * cfx method: cfx_getLogs
 * 
 * inputs example:
 Object - The filter options:
    fromBlock: QUANTITY|TAG - (optional, default: "latest") Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
    toBlock: QUANTITY|TAG - (optional, default: "latest") Integer block number, or "latest" for the last mined block or "pending", "earliest" for not yet mined transactions.
    address: DATA|Array, 20 Bytes - (optional) Contract address or a list of addresses from which logs should originate.
    topics: Array of DATA, - (optional) Array of 32 Bytes DATA topics. Topics are order-dependent. Each topic can also be an array of DATA with “or” options.
    blockhash: DATA, 32 Bytes - (optional, future) 
 * outputs example:
    TODO
 */

async function inputAdaptor(params) {
  if (params.length > 0) {
    let fromBlock = params[0].fromBlock;
    let toBlock = params[0].toBlock;
    params[0].fromEpoch = format.formatEpoch(fromBlock);
    params[0].toEpoch = format.formatEpoch(toBlock);
  }
}

async function outputAdaptor(response) {
  if (!response || !response.result) return;
  let logs = response.result;
  logs.forEach(l => (l.address = format.formatHexAddress(l.address)));
}

module.exports = new Adaptor(inputAdaptor, outputAdaptor);
