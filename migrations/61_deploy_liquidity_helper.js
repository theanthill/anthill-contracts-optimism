/**
 * Deploy the liquidity helper to allow for adding liquidity + staking LP tokens in one call
 */
const {getTokenContract, getSwapFactory, getPancakeRouter} = require('./external-contracts');
const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();

    const swapFactory = await getSwapFactory(network);
    const swapRouter = await getPancakeRouter(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const PoolContract = artifacts.require(pool.contractName);
        const HelperContract = artifacts.require(pool.helperContract);

        const otherToken = await getTokenContract(pool.otherToken, network);
        const poolContract = await PoolContract.deployed();

        const LPToken = await swapFactory.getPair(antToken.address, otherToken.address);

        console.log(`Deploying liquidity helper for pair ANT/${pool.otherToken}`);
        const liquidityHelper = await deployer.deploy(
            HelperContract,
            antToken.address,
            otherToken.address,
            LPToken,
            poolContract.address,
            swapRouter.address
        );

        console.log(`Assigning liquidity helper as ANT/${pool.otherToken} staking pool operator`);
        await poolContract.transferOperator(liquidityHelper.address);
    }
};
