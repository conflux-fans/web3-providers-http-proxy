
module.exports = {
    emptyFn: origin => origin,

    defaultAdaptor: payload => this.emptyFn,

    numToHex: num => `0x${num.toString(16)}`
}