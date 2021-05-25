/**
 * Export external contracts addresses
 */
const {getPancakeFactory, getPancakeRouter, getBUSD} = require('./external-contracts');
const {exportContract, exportToken} = require('./export-contracts');
const AntToken = artifacts.require('AntToken');

module.exports = async (deployer, network, accounts) => {
    const busd = await getBUSD(network);
    const pancakeRouter = await getPancakeRouter(network);
    const pancakeFactory = await getPancakeFactory(network);
    const antToken = await AntToken.deployed();

    const busdAntPairAddress = await pancakeFactory.getPair(busd.address, antToken.address);

    exportToken('BUSD', busd.address, 18);
    exportToken('ANT-BUSD', busdAntPairAddress, 18);
    exportContract('PancakeRouter', pancakeRouter.address, 18);
};
