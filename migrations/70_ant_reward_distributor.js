/**
 * Deployment of the initial reward distributor for each pool that generates ANT Tokens as rewards
 */
const BigNumber = require('bignumber.js');

const {ANTBUSDLPTokenPool, ANTBNBLPTokenPool, ANTBUSD_POOL_ANT_REWARD_ALLOCATION} = require('./migration-config');

const AntToken = artifacts.require('AntToken');
const InitialAntTokenDistributor = artifacts.require('InitialAntTokenDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const unit = BigNumber(10 ** 18);
    const antRewardAllocationAmount = unit.times(ANTBUSD_POOL_ANT_REWARD_ALLOCATION);

    const antToken = await AntToken.deployed();

    const poolsConfig = [ANTBUSDLPTokenPool, ANTBNBLPTokenPool];
    const poolsContracts = poolsConfig.map(({contractName}) => artifacts.require(contractName));
    const poolsAddresses = poolsContracts.map((p) => p.address);

    // Deploy ANT Token distributor with every pool that generates ANT Token rewards
    await deployer.deploy(InitialAntTokenDistributor, antToken.address, poolsAddresses, antRewardAllocationAmount);
    const distributor = await InitialAntTokenDistributor.deployed();

    console.log(`Setting distributor to InitialAntTokenDistributor (${distributor.address})`);

    // Wait for the pools to deploy and communicate the reward distributor they will use
    for await (const poolContract of poolsContracts) {
        const pool = await poolContract.deployed();
        await pool.setRewardDistribution(distributor.address);
    }

    // Mint enough ANT Tokens for the distributor
    await antToken.transfer(distributor.address, antRewardAllocationAmount);
    console.log(`Deposited ${ANTBUSD_POOL_ANT_REWARD_ALLOCATION} ANT to InitialAntTokenDistributor.`);

    // Distribute the rewards to the pools
    await distributor.distribute();
};