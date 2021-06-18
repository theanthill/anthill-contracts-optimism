/**
 * Creates the pairs contracts for the liquidity pools. This is needed because the Oracle will need
 * the pair contract already existing when its constructor is executed
 */
const BigNumber = require('bignumber.js');

const {INITIAL_DEPLOYMENT_POOLS} = require('./migration-config');
const {getTokenContract, getPancakeFactory} = require('./external-contracts');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const pancakeFactory = await getPancakeFactory(network);

    for (let pool of INITIAL_DEPLOYMENT_POOLS)
    {
        const otherToken = await getTokenContract(pool.otherToken, network);

        console.log(`Creating pair for the pool ANT/${pool.otherToken}`);
        await pancakeFactory.createPair(antToken.address, otherToken.address);
    }
}

module.exports = migration;
