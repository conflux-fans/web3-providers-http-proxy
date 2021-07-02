const Adaptor = require('../JsonRPCAdaptor');
const format = require('../format');
const util = require('../util');
const { Transaction } = require('js-conflux-sdk');

/**
 * eth method: eth_sendTransaction
 * cfx method: cfx_sendTransaction
 * 
 * inputs example:
 * 
 * outputs example:
 * 
 */

function methodAdaptor(method, params) {
  let hexAddress = format.formatHexAddress(params[0].from);
  let address = format.formatAddress(hexAddress, this.cfx.networkId);
  return this.cfx.wallet.has(address) ? 'cfx_sendRawTransaction' : method;
}

async function inputAdaptor(params) {
  if (params.length === 0) throw new Error('The first parameter should be an transaction');
  params[0] = await format.formatTxParams(this.cfx, params[0]);
  if (this.cfx.wallet.has(params[0].from)) {
    let tx = new Transaction(params[0]);
    let account = this.cfx.wallet.get(params[0].from);
    tx.sign(account.privateKey, this.cfx.networkId);
    params[0] = tx.serialize();
  }
}

module.exports = new Adaptor(inputAdaptor, util.asyncEmptyFn, methodAdaptor);
