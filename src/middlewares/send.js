const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');

function sendMiddleware(url) {
    const provider = providerFactory({ url: url });    
    return createAsyncMiddleware(sendRequest);
    
    async function sendRequest(req, res) {
        let tmp = await provider.request(req);
        res.result = tmp.result;
    }
}

module.exports = sendMiddleware;