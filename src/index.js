const debug = require("debug")("provider-proxy");
const Web3HttpProvider = require("web3-providers-http");
const { ethToConflux, defaultAdaptor } = require("./ethToConflux");
const format = require("./format");
const { Conflux } = require('js-conflux-sdk');

class Web3HttpProviderProxy extends Web3HttpProvider {
  constructor(host, options) {
    super(host, options);
    this.chainAdaptor = options.chainAdaptor || {};
    if (!options.networkId) {
      throw new Error("options.networkId is needed");
    }
    let cfx = new Conflux({
      url: host,
      networkId: options.networkId
    });

    //
    let addresses = [];
    if (options.privateKeys && Array.isArray(options.privateKeys)) {
      for(let key of options.privateKeys) {
        let account = cfx.wallet.addPrivateKey(key);
        addresses.push(account.address);
      }
    }
    if (options.mnemonic) {

    }
    this.addresses = addresses;
    this.cfx = cfx;
  }

  send(payload, callback) {
    let originMethod = payload.method;
    let adaptor = ethToConflux[originMethod] || defaultAdaptor;
    adaptor.cfx = this.cfx;

    // hack eth_accounts method
    if (this.addresses.length > 0 && payload.method === 'eth_accounts') {
      callback(null, {
        result: this.addresses.map((a) => format.formatHexAddress(a)),
        jsonrpc: '2.0',
        id: payload.id
      });
      return;
    }
    
    const promiseSend = () => new Promise((resolve, reject) => {
      debug(`Proxy ${originMethod} to ${payload.method}`);
      debug(`Proxy params: ${JSON.stringify(payload, null, '\t')}`);
      super.send(payload, (err, response) => {
        console.log(err, response);
        err ? reject(err) : resolve(response)
      });
    });

    adaptor
      .adaptInput(payload)
      .then(promiseSend)
      .then(adaptor.adaptOutput.bind(adaptor))
      .then(response => callback(null, response))
      .catch(err => callback(err));
  }
}

module.exports = {
  HttpProvider: Web3HttpProviderProxy,
  ethToConflux,
  format,
  util: require('./util'),
};
