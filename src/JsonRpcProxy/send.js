const { createAsyncMiddleware } = require('json-rpc-engine');
const { providerFactory } = require('js-conflux-sdk');

class Agent {
    constructor(url) {
        this.provider = providerFactory({ url: url });
    }
}

function createSendMiddleware(url) {
    const agent = new Agent(url);

    return createAsyncMiddleware(sendRequest);
    
    async function sendRequest(req, res) {
        let tmp = await agent.provider.request(req);
        res.result = tmp.result;
    }
}

module.exports = createSendMiddleware;