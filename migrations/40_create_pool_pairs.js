/**
 * Creates the pairs contracts for the liquidity pools. This is needed because the Oracle will need
 * the pair contract already existing when its constructor is executed
 */
const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');
const {getTokenContract, getSwapFactory} = require('./external-contracts');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const swapFactory = await getSwapFactory(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const otherToken = await getTokenContract(pool.otherToken, network);

        console.log(`Creating pair for the pool ANT/${pool.otherToken}`);
        const pairAddress = await swapFactory.createPair(antToken.address, otherToken.address);

        console.log(`  - Pair created at address ${pairAddress.address}`);
    }
}

module.exports = migration;
