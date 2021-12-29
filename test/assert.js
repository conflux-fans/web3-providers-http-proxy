const utils = require('../src/utils');
const assert = require('chai').assert;
const { address } = require("js-conflux-sdk")
const { unfold } = require('../src/utils');

const txKeys = [
    'blockHash',
    'blockNumber',
    'from',
    'gas',
    'gasPrice',
    'hash',
    'input',
    'nonce',
    'to',
    'transactionIndex',
    'value',
    'v',
    'r',
    's'
];

const receiptKeys = [
    'transactionHash',
    'transactionIndex',
    'blockHash',
    'blockNumber',
    'from',
    'to',
    'cumulativeGasUsed',
    'gasUsed',
    'contractAddress',
    'logsBloom',
];

const blockKeys = [
  'number',
  'hash',
  'parentHash',
  'nonce',
  'sha3Uncles',
  'logsBloom',
  'transactionsRoot',
  'stateRoot',
  'receiptsRoot',
  'miner',
  'difficulty',
  'totalDifficulty',
  'extraData',
  'size',
  'gasLimit',
  'gasUsed',
  'transactions',
  'uncles',
];

function isHex(val) { assert(utils.isHex(val), `expect hex, actual ${val}`) }
function isHexOrNull(val) { assert(utils.isHexOrNull(val), `expect hex or null, actual ${val}`) }
function isValidCfxAddress(val) { assert(address.isValidCfxAddress(val), `expect cfx address, actual ${val}`) }
function isValidCfxAddressOrNull(val) { assert(val === null || address.isValidCfxAddress(val), `expect cfx address, actual ${val}`) }
function isContainsAllKeys(val, keys) { assert.containsAllKeys(val, keys, `should contrain all keys, actual ${val}`) }

function isBlockWithHexAddress(val) {
  isContainsAllKeys(val, blockKeys);
  isHex(val.miner)
}

function isTxWithCfxAddress(val) {
    isContainsAllKeys(val, txKeys);
    isValidCfxAddress(val.from)
    isValidCfxAddressOrNull(val.to)
}
function isTxWithHexAddress(val) {
    isContainsAllKeys(val, txKeys);
    isHex(val.from)
    isHexOrNull(val.to)
}
function isTxReceiptWithCfxAddress(val) {
    isContainsAllKeys(val, receiptKeys);
    isValidCfxAddress(val.from)
    isValidCfxAddressOrNull(val.to)
    isValidCfxAddressOrNull(val.contractAddress)
}

function isTxReceiptWithHexAddress(val) {
    isContainsAllKeys(val, receiptKeys);
    isHex(val.from)
    isHexOrNull(val.to)
    isHexOrNull(val.contractAddress)
}

function isEip155Sign(tx) {
    assert(tx.v >= 35, `v of eip155 signed tx should not small than 35, actual ${tx.v}`)
}

function isCFXSign(tx) {
    assert(tx.v <= 1, `v of cfx signed tx should be 0 or 1, actual ${tx.v}`)
}

function isErrorUndefined(val) {
    assert.isUndefined(val, `unexpected error: ${unfold(val)}`)
}

function inArray(val, array) {
    assert(array.indexOf(val) >= 0, `unexpect message: ${val}`)
}

module.exports = {
    isHex,
    isHexOrNull,
    isValidCfxAddress,
    isValidCfxAddressOrNull,
    isContainsAllKeys,
    isTxWithCfxAddress,
    isTxWithHexAddress,
    isTxReceiptWithCfxAddress,
    isTxReceiptWithHexAddress,
    isEip155Sign,
    isCFXSign,
    isErrorUndefined,
    inArray,
    isBlockWithHexAddress,
    blockKeys,
};