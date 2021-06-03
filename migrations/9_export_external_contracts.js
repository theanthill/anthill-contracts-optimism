/**
 * Export external contracts addresses
 */
const {getPancakeFactory, getPancakeRouter, getBUSD, getBNB} = require('./external-contracts');
const {exportContract, exportToken} = require('./export-contracts');
const AntToken = artifacts.require('AntToken');

module.exports = async (deployer, network, accounts) => {
    const BUSD = await getBUSD(network);
    const BNB = await getBNB(network);
    const pancakeRouter = await getPancakeRouter(network);
    const pancakeFactory = await getPancakeFactory(network);
    const antToken = await AntToken.deployed();

    const BUSDANTPairAddress = await pancakeFactory.getPair(BUSD.address, antToken.address);
    const BNBANTPairAddress = await pancakeFactory.getPair(BNB.address, antToken.address);

    exportToken('BUSD', BUSD.address, 18);
    exportToken('BNB', BNB.address, 18);
    exportToken('ANT-BUSD', BUSDANTPairAddress, 18);
    exportToken('ANT-BNB', BNBANTPairAddress, 18);
    exportContract('PancakeRouter', pancakeRouter.address, 18);
};
