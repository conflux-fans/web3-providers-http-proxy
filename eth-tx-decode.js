const Web3 = require('web3');
var RLP = require('rlp');
const {format, Transaction} = require('js-conflux-sdk');
const util = require('./src/util');
let web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
let privateKey = '0x84d67b31d9272e8a83e59f414b9b89a8ae5bf83c7a3b588e27a91c2ccc461256';
// let account = web3.eth.accounts.create();
// let account = web3.eth.accounts.privateKeyToAccount(privateKey);
// console.log(account);

// web3.eth.accounts.signTransaction({
//   to: '0xF0109fC8DF283027b6285cc889F5aA624EaC1F55',
//   value: '1000000000',
//   gas: 2000000,
//   nonce: 1,
// }, '0x4c0883a69102937d6231471b5dbb6204fe5129617082792ae468d01a3f362318')
// .then(console.log);

let rawTx = '0xf86b018504a817c800831e848094f0109fc8df283027b6285cc889f5aa624eac1f55843b9aca0080820a95a0a6d9acbd4c50a199a1634d9e7d7479c8b998596592653dde6a99859fe9569882a0308aa9bca241405833fd948515b211e7a41c7d64e28fa8f69967b3ef936acf09';
console.log(RLP.decode(rawTx));
let txInfo = util.decodeEthRawTx(rawTx);
txInfo.storageLimit = util.MAX_UINT64;
txInfo.epochHeight = util.MAX_UINT64;
let tx = new Transaction(txInfo);
console.log(tx.serialize());

/**
nonce - transaction sequence number fr the sending account
gasprice - price you are offering to pay
startgas - maximum amount of gas allowed for the transaction
to - destination address (account or contract address)
value - eth to transfer to the destination, if any
data - all of the interesting stuff goes here
v - along with r and s makes up the ECDSA signature
r
s
*/