const { blockKeys } = require('./assert');
const ProxyProvider = require('../src');
const { account } = require('./client');
const erc20Meta = require('./SHN.json');
const { describe, it } = require("mocha");
const Web3 = require('web3');
const chai = require('chai');
chai.should();

const web3 = new Web3(Web3.givenProvider);
web3.eth.accounts.wallet.add(account.PrivateKey);

let URL = "https://test.confluxrpc.com";
URL = 'http://net8888.confluxrpc.com';

const provider = new ProxyProvider(URL, {
  respAddressBeHex: true,
});
web3.setProvider(provider);

// 8888 network
const erc20Address = '0x899aac0e5df3dc9bfd64aa2483fb7cace0373251';

describe('Web3 common RPC methods', function() {
  it('eth_blockNumber', async function() {
    const blockNumber = await web3.eth.getBlockNumber();
    blockNumber.should.be.a('number');
  });

  it('eth_getBlockByNumber', async function () {
    // get block by number
    const blockNumber = await web3.eth.getBlockNumber();
    let block = await web3.eth.getBlock(blockNumber);
    block.should.be.a('object');
    block.should.include.all.keys(blockKeys);

    // get block by hash
    block = await web3.eth.getBlock(block.hash);
    block.should.be.a('object');
    block.should.include.all.keys(blockKeys);
  });

  it('eth_getTransactionByHash', async function() {
    const txHash = '0x790a2e14ea14b081551160264d9f529aed024099d6fb980f4e1777d5e8067bcd';  // testnet hash
    const tx = await web3.eth.getTransaction(txHash);
    if (tx) {
      tx.should.be.a('object');
    }
  });

  it('eth_sendRawTransaction', async function() {
    web3.eth.sendTransaction({
      from: account.HexAddress,
      to: account.HexAddress,
      value: 1,
      gas: 21000,
      gasPrice: 1
    }, (err, txHash) => {
      txHash.should.be.a('string');
    });
  });

  it('deployContract', async function() {
    const contract = new web3.eth.Contract(erc20Meta.abi);
    contract.deploy({
      data: erc20Meta.bytecode,
    }).send({
      from: account.HexAddress,
      gas: 10000000,
      gasPrice: 1
    }).on('receipt', function(receipt) {
      receipt.should.be.a('object');
      receipt.contractAddress.should.be.a('string');
    });
  });

  it('interactWithContract', async function() {
    const contract = new web3.eth.Contract(erc20Meta.abi, erc20Address); 
    
    // query balance
    const balance = await contract.methods.balanceOf(account.HexAddress).call();
    balance.should.be.a('string');

    const targetAddress = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe';

    // transfer
    const receipt = await contract.methods.transfer(targetAddress, 100).send({
      from: account.HexAddress,
      gas: 200000,
    });
    receipt.should.be.a('object');

    const targetBalance = await contract.methods.balanceOf(targetAddress).call();
    targetBalance.should.be.a('string');

    const blockNumber = await web3.eth.getBlockNumber();
    const events = await contract.getPastEvents('Transfer', {
      fromBlock: blockNumber - 200,
      toBlock: blockNumber,
    });
    events.should.be.a('array');
    console.log(events);

  });

  it('getContractEvent', async function() {
    const contract = new web3.eth.Contract(erc20Meta.abi, erc20Address);
    const blockNumber = await web3.eth.getBlockNumber();
    const events = await contract.getPastEvents('Transfer', {
      fromBlock: blockNumber - 100,
      toBlock: blockNumber,
    });
    events.should.be.a('array');
  });

});