/**
 * Creation of the LP Token Staking pools for the supported pairs
 */
const {getTokenContract, getSwapFactory} = require('./external-contracts');
const {POOL_START_DATE} = require('../deploy.config.js');
const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const swapFactory = await getSwapFactory(network);
    const antToken = await AntToken.deployed();

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const otherToken = await getTokenContract(pool.otherToken, network);
        const poolContract = artifacts.require(pool.contractName);

        console.log(`Deploying staking pool for the ANT/${pool.otherToken} pair`);
        const LPToken = await swapFactory.getPair(antToken.address, otherToken.address);
        await deployer.deploy(poolContract, antToken.address, LPToken, POOL_START_DATE);
    }
};
