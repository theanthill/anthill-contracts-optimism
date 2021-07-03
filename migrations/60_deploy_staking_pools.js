/**
 * Creation of the LP Token Staking pools for the supported pairs
 */
const {getTokenContract, getPancakeFactory} = require('./external-contracts');
const {POOL_START_DATE} = require('../deploy.config.js');
const {INITIAL_DEPLOYMENT_POOLS} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const pancakeFactory = await getPancakeFactory(network);
    const antToken = await AntToken.deployed();

    for (let pool of INITIAL_DEPLOYMENT_POOLS) {
        const otherToken = await getTokenContract(pool.otherToken, network);
        const poolContract = artifacts.require(pool.contractName);

        console.log(`Deploying staking pool for the ANT/${pool.otherToken} pair`);
        const LPToken = await pancakeFactory.getPair(antToken.address, otherToken.address);
        await deployer.deploy(poolContract, antToken.address, LPToken, POOL_START_DATE);
    }
};
