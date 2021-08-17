const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./middlewares');
const sendJSONRPC = require('./middlewares/send');

class JsonRpcProxy {
  constructor(url, networkId) {
    this.url = url;
    this.networkId = networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(eth2Cfx({url, networkId}));
    this.engine.push(sendJSONRPC({url}));
  }

  async send(req) {
    return await this.engine.handle(req);
  }

  request(req, callback) {
    if (!callback) {
      return this.engine.handle(req);
    }
    this.engine.handle(req, callback);
  }
}

module.exports = JsonRpcProxy;