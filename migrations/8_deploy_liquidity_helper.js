/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const externalContracts = require('./external-contracts');

const AntToken = artifacts.require('AntToken');
const Oracle = artifacts.require('Oracle');
const BUSDANTLPTokenANTPool = artifacts.require('BUSDANTLPTokenANTPool');
const LiquidityProviderHelper = artifacts.require('LiquidityProviderHelper');

module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();
    const oracle = await Oracle.deployed();
    const lpTokenPool = await BUSDANTLPTokenANTPool.deployed();

    const pancakeFactory = await externalContracts.getPancakeFactory(network);
    const pancakeRouter = await externalContracts.getPancakeRouter(network);
    const BUSD = await externalContracts.getBUSD(network);
    
    // Get the LP token for the ANT-BUSD pair
    const BUSDAntLPToken = await oracle.pairFor(pancakeFactory.address, antToken.address, BUSD.address);

    await deployer.deploy(LiquidityProviderHelper, antToken.address, BUSD.address, BUSDAntLPToken, lpTokenPool.address, pancakeRouter.address);
    console.log("Deployed LiquidityProviderHelper");

    const lpProviderHelper = await LiquidityProviderHelper.deployed();

    await lpTokenPool.transferOwnership(lpProviderHelper.address);
};
