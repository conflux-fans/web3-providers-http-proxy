const { JsonRpcEngine } = require("json-rpc-engine");
const createAdaptorMiddleware = require('./Adaptor');
const createSendMiddleware = require('./send'); 

class Proxy {
    constructor(url, networkId) {
        this.url = url;
        this.networkId = networkId;
        this.engine = new JsonRpcEngine();
        this.init();
    }

    init() {
        this.engine.push(createAdaptorMiddleware(this.url, this.networkId));
        this.engine.push(createSendMiddleware(this.url));
    }

    async send(req) {
        let res = await this.engine.handle(req);
        return res;
    }
}

module.exports = Proxy;