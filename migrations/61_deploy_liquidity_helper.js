/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const {getTokenContract, getPancakeFactory, getPancakeRouter} = require('./external-contracts');
const {INITIAL_DEPLOYMENT_POOLS} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const Oracle = artifacts.require('Oracle');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();
    const oracle = await Oracle.deployed();

    const pancakeFactory = await getPancakeFactory(network);
    const pancakeRouter = await getPancakeRouter(network);
    
    for (let pool of INITIAL_DEPLOYMENT_POOLS)
    {
        const PoolContract = artifacts.require(pool.contractName);
        const HelperContract = artifacts.require(pool.helperContract);

        const otherToken = await getTokenContract(pool.otherToken, network);
        const poolContract = await PoolContract.deployed();

        const LPToken = await oracle.pairFor(pancakeFactory.address, antToken.address, otherToken.address);

        console.log(`Deploying liquidity helper for pair ANT/${pool.otherToken}`);
        const liquidityHelper = await deployer.deploy(HelperContract, antToken.address, otherToken.address, LPToken, poolContract.address, pancakeRouter.address);
        
        console.log(`Transferring ANT/${pool.otherToken} staking pool ownership to helper`);
        await poolContract.transferOwnership(liquidityHelper.address);
    }
};
