const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./eth2Cfx');
const methodMapMiddleware = require('./mapETHMethod');

module.exports = function (options) {
  const {url, networkId} = options;
  const engine = new JsonRpcEngine();
  engine.push(eth2Cfx({url, networkId}));
  engine.push(methodMapMiddleware());
  return engine.asMiddleware();
}