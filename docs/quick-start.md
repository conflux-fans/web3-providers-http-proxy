# Conflux RPC-bridge 服务使用

Conflux RPC-bridge 服务可以将 Conflux 的 RPC 方法 bridge 成以太坊方法，意味着可以直接使用以太坊的工具，SDK，钱包来同 Conflux 网络交互。

## 获取 RPC-bridge 服务地址

可以自己运行或使用公共的主网或测试网 RPC-bridge 服务

## 查找以太坊 Conflux 兼容的地址（账户）

由于历史原因 Conflux 将地址（hex格式）按首位划分到不同的命名空间，分别是 0x0-内置合约，0x1-普通地址，0x8-用户创建合约地址。只有以此三个前缀开头的 hex40 地址才是一个合法的 Conflux 地址。
因此如果想使用以太坊生态工具或产品结合 RPC-bridge 与 Conflux 网络交互的话，需要先找到一个 0x1 开头的账户。

可以使用 Conflux 社区开发的[地址查找工具](https://conflux-fans.github.io/web-toolkit/#/address-filter)从一个助记词查找 0x1 地址。 也可有使用 js-conflux-sdk 提供的 cli 程序随机生成一个 0x1 账户。

```sh
$ cfxjs genEthCMPTaccount
PrivateKey:  0x859c5257bd0190050ed19ba8ee5bc80fdf2fb3044277f9a205bd10957631423e
Address:  0x12002a408e47f9ac6ed11b20c32f59025570078a
```

切记：

1. 进行 CFX 转账，如果转到一个非 `0x1`，`0x8` 地址将会失败。在做转账前请对地址做详细检查
2. 与合约交互，调用合约方法涉及到地址的地方同样需要确保使用一个 `0x1` 地址。如果使用 web3.js 或 ethers.js 开发 Conflux Dapp，需要 Dapp 对交互中涉及到地址的地方进行 check

## 以太坊生态产品

### web3.js

直接用 RPC-bridge url 初始化 Web3 对象即可

### ethers.js

使用 ether.js 同 Conflux RPC-bridge 服务交互有几个地方需要注意：

1. 发送交易时 RPC-bridge 返回的交易 hash，同 SDK 计算的 hash 不一致，SDK 会做检查。所以需要使用定制版的 ethers.js
2. Conflux 的合约地址生成规则同以太坊有很大差别，所以 ethers.js 自行计算的合约地址同部署后 Conflux 链上最终的实际合约地址不一致。所以需要等部署交易执行后获取 Receipt 中的合约地址，并设置 ethers 合约对象实例的地址属性。参考代码如下：

```js
let factory = new ethers.ContractFactory(abi, bytecode, wallet);
let contract = await factory.deploy();
let receipt = await contract.deployTransaction.wait();
contract = contract.attach(receipt.contractAddress);
// interact with the contract object
let balance = await contract.balanceOf(wallet.address);
console.log(ethers.utils.formatEther(balance));
```

### Truffle

使用 `HDWalletProvider` 配置地址以 `0x1` 开头的账户私钥，以及 RPC-bridge 服务地址。

```js
networks: {
  development: {
    network_id: "*",       // Any network (default: none)
    provider: function() {
      return new HDWalletProvider({
        privateKeys: ['0x848decfce5275f85de1608632f8cf71c739bff6084462f12471eabfd00000000'],
        providerOrUrl: "http://127.0.0.1:8545"
      });
    },
  }
}
```

### Hardhat
