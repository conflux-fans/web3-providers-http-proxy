const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');

function sendMiddleware(url) {
    const provider = providerFactory({ url: url });    
    return createAsyncMiddleware(sendRequest);
    
    async function sendRequest(req, res, next) {
        let tmp = await provider.request(req);
        if (tmp.result) {
          res.result = tmp.result;
        } else {
          res.error = tmp.error;
        }
    }
}

module.exports = sendMiddleware;