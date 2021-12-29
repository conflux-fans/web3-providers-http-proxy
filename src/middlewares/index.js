const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./eth2Cfx');
const methodMapMiddleware = require('./eth2CfxMethodMapper');

module.exports = function (options) {
  const engine = new JsonRpcEngine();
  engine.push(eth2Cfx(options));
  engine.push(methodMapMiddleware());
  return engine.asMiddleware();
}