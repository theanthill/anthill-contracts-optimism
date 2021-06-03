/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const externalContracts = require('./external-contracts');
const {WBNB} = require('./known-contracts');

const AntToken = artifacts.require('AntToken');
const Oracle = artifacts.require('Oracle');
const BUSDANTLPTokenANTPool = artifacts.require('BUSDANTLPTokenANTPool');
const BUSDANTLPHelper = artifacts.require('BUSDANTLPHelper');
const BNBANTLPTokenANTPool = artifacts.require('BNBANTLPTokenANTPool');
const BNBANTLPHelper = artifacts.require('BNBANTLPHelper');

module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();
    const oracle = await Oracle.deployed();
    const BUSDANTPool = await BUSDANTLPTokenANTPool.deployed();
    const BNBANTPool = await BNBANTLPTokenANTPool.deployed();

    const pancakeFactory = await externalContracts.getPancakeFactory(network);
    const pancakeRouter = await externalContracts.getPancakeRouter(network);
    const BUSD = await externalContracts.getBUSD(network);
    const BNB = await externalContracts.getBNB(network);
    
    // LP Helper for the ANT-BUSD pair
    const BUSDAntLPToken = await oracle.pairFor(pancakeFactory.address, antToken.address, BUSD.address);

    await deployer.deploy(BUSDANTLPHelper, antToken.address, BUSD.address, BUSDAntLPToken, BUSDANTPool.address, pancakeRouter.address);
    console.log("Deployed BUSDANTLPHelper");

    const BUSDANTHelper = await BUSDANTLPHelper.deployed();
    await BUSDANTPool.transferOwnership(BUSDANTHelper.address);

    // LP Helper for the BNB-BUSD pair
    const BNBAntLPToken = await oracle.pairFor(pancakeFactory.address, antToken.address, BNB.address);

    await deployer.deploy(BNBANTLPHelper, antToken.address, BNB.address, BNBAntLPToken, BNBANTPool.address, pancakeRouter.address);
    console.log("Deployed BNBANTLPHelper");

    const BNBANTHelper = await BNBANTLPHelper.deployed();
    await BNBANTPool.transferOwnership(BNBANTHelper.address);
};
