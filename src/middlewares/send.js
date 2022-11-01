const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');
const debug = require('debug')('eth2cfx');

function sendMiddleware(url, options) {
  const provider = providerFactory({ url, ...options });
  return createAsyncMiddleware(sendRequest);

  async function sendRequest(req, res) {
    let _response = await provider._request(req);

    if (_response.error) {
      debug(_response.error);
      res.error = _response.error;
    } else {
      res.result = _response.result;
    }

  }
}

module.exports = sendMiddleware;