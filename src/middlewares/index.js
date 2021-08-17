const { JsonRpcEngine } = require("json-rpc-engine");
const eth2Cfx = require('./middlewares/eth2Cfx');
const methodMapMiddleware = require('./middlewares/mapETHMethod');

module.exports = function (options) {
  const {url, networkId} = options;
  const engine = new JsonRpcEngine();
  engine.push(eth2Cfx({url, networkId}));
  engine.push(methodMapMiddleware());
  return engine.asMiddleware();
}