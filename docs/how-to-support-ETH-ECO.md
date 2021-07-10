
# 如何为 Conflux 适配以太坊生态
2. 需要开发一个 bridge service 将 Conflux RPC 适配成以太坊 RPC （需要确定钱包，Dapp 需要的最小 RPC 方法集合）
3. 开发一个纯前端页面或cli，用于快速从助记词中找到 0x1 开头的地址，给出序号及私钥 (注意 coinType )
5. 适配合约开发工具： truffle，hardhat，remix
6. 梳理以太坊 Dapp 迁移至 Conflux 需要做的工作: 重点
7. hd wallet 适配
8. 编写完整全面的文档