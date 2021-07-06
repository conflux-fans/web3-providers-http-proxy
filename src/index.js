const { JsonRpcEngine } = require("json-rpc-engine");
const cfx2Eth = require('./middlewares/eth2Cfx');
const sendJSONRPC = require('./middlewares/send');

class JsonRpcProxy {
  constructor(url, networkId) {
    this.url = url;
    this.networkId = networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(cfx2Eth({url, networkId}));
    this.engine.push(sendJSONRPC(this.url));
  }

  async send(req) {
    return await this.engine.handle(req);
  }
}

module.exports = JsonRpcProxy;