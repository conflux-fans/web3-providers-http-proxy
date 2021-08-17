const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');

function sendMiddleware(options) {
  const provider = providerFactory(options);
  return createAsyncMiddleware(sendRequest);

  async function sendRequest(req, res, next) {
    let _response = await provider.request(req);
    if (_response.error) {
      res.error = _response.error;
    } else {
      res.result = _response.result;
    }
  }
}

module.exports = sendMiddleware;