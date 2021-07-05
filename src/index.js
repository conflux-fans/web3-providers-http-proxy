const { JsonRpcEngine } = require("json-rpc-engine");
const cfx2Eth = require('./middlewares/eth2Cfx');
const sendJSONRPC = require('./middlewares/send');

class JsonRpcProxy {
  constructor(url, networkId) {
    this.url = url;
    this.networkId = networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(cfx2Eth(this.url, this.networkId));
    this.engine.push(sendJSONRPC(this.url));
  }

  async send(req) {
    const res = await this.engine.handle(req);
    return res;
  }
}

module.exports = JsonRpcProxy;