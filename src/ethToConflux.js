const Adaptor = require("./JsonRPCAdaptor");

module.exports = {
    ethToConflux: require('./ethToCfxAdaptors'),
    defaultAdaptor: new Adaptor(),
};
