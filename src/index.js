const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./middlewares');
const sendJSONRPC = require('./middlewares/send');
const logger = require('./middlewares/logger')

const defaultOption = {
  respAddressBeHex: false,
  respTxBeEip155: false
}

class JsonRpcProxy {

  constructor(url, options = defaultOption) {
    this.url = url;
    // this.networkId = options?.networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(logger)
    this.engine.push(eth2Cfx({ ...options, url }));
    this.engine.push(sendJSONRPC(url));
  }

  send(req, callback) {
    this.engine.handle(req, callback)
  }

  asyncSend(req) {
    return this.engine.handle(req)
  }

  // Comment because of leads ethers error
  // request(req, callback) {
  //   if (!callback) {
  //     return this.engine.handle(req);
  //   }
  //   this.engine.handle(req, callback);
  // }
}

module.exports = JsonRpcProxy;