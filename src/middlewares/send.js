const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');
const debug = require("debug")("send")
const { unfold } = require("../utils")

function sendMiddleware(url, options) {
  const provider = providerFactory({ url, ...options });
  return createAsyncMiddleware(sendRequest);

  async function sendRequest(req, res) {
    debug("pre_send %O", req)
    let _response = await provider.request(req);
    debug(unfold({ req, _response }))
    if (_response.error) {
      res.error = _response.error;
    } else {
      res.result = _response.result;
    }

  }
}

module.exports = sendMiddleware;