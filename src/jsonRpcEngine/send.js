const axios = require('axios');
const { createAsyncMiddleware } = require('json-rpc-engine');

function createSendMiddleware(url) {
    let URL = url;
    return createAsyncMiddleware(sendRequest);
    async function sendRequest(req, res) {
        let tmp = await axios.post(URL, req);
        res.result = tmp.data.result;
    }
}

module.exports = createSendMiddleware;