/**
 * Creation of the ANT-BUSD LP Token pool that rewards ANT token to the stake holders
 */
const externalContracts = require('./external-contracts');
const {POOL_START_DATE} = require('../deploy.config.ts');

const AntToken = artifacts.require('AntToken');
const Oracle = artifacts.require('Oracle');

const BUSDANTLPTokenANTPool = artifacts.require('BUSDANTLPTokenANTPool');

module.exports = async (deployer, network, accounts) => {
    const pancakeFactory = await externalContracts.getPancakeFactory(network);
    const antToken = await AntToken.deployed();
    const BUSD = await externalContracts.getBUSD(network);
    const oracle = await Oracle.deployed();

    // Get the LP token for the ANT-BUSD pair
    const BUSDAntLPToken = await oracle.pairFor(pancakeFactory.address, antToken.address, BUSD.address);

    await deployer.deploy(BUSDANTLPTokenANTPool, antToken.address, BUSDAntLPToken, POOL_START_DATE);
};
