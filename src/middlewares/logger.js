const { createAsyncMiddleware } = require("json-rpc-engine");
const { createDebug } = require("../utils")
const debug = createDebug("log")

module.exports = createAsyncMiddleware(async function (req, res, next) {
    debug("pre_send %O", req)
    await next().catch(err => {
        debug("error %u", { req, err })
    })
    debug("sent %u", { req, res })
})