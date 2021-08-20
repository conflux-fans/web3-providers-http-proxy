const { JsonRpcEngine } = require("json-rpc-engine");
const cfx2Eth = require('./middlewares/eth2Cfx');
const sendJSONRPC = require('./middlewares/send');
const methodMapMiddleware = require('./middlewares/mapETHMethod');
const { unfold } = require("./utils")
const debug = require("debug")("app")

class JsonRpcProxy {
  constructor(url, respAddressBeHex) {
    this.url = url;
    // this.networkId = options?.networkId;
    this.engine = new JsonRpcEngine();
    this.engine.push(cfx2Eth({ respAddressBeHex, url }));
    this.engine.push(methodMapMiddleware());
    this.engine.push(sendJSONRPC(this.url));
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
}

module.exports = JsonRpcProxy;