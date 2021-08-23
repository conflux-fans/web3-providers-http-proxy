const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./middlewares');
const sendJSONRPC = require('./middlewares/send');
const { unfold } = require("./utils")
const debug = require("debug")("app")

const defaultOption = {
  respAddressBeHex: false,
  respTxBeEip155: false
}
class JsonRpcProxy {

  constructor(url, options = defaultOption) {
    this.url = url;
    // this.networkId = options?.networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(eth2Cfx({ ...options, url }));
    this.engine.push(sendJSONRPC(url));
  }

  send(req, callback) {
    this.engine.handle(req, function (err, res) {
      debug(unfold({ req, res, err }))
      callback(err, res)
    });
  }

  async asyncSend(req) {
    return await this.engine.handle(req).then(res => {
      debug(unfold({ req, res }))
      return res
    }).catch(err => {
      debug(unfold({ req, err }))
      throw err
    });
  }

  request(req, callback) {
    if (!callback) {
      return this.engine.handle(req);
    }
    this.engine.handle(req, callback);
  }
}

module.exports = JsonRpcProxy;