/**
 * Allocation of Ant Tokens for Rewards Distributor and initial distribution, only for Testnet.
 * On the Mainnet the allocation will be done by the Treasury account
 */
const BigNumber = require('bignumber.js');

const {MAIN_NETWORKS} = require('../deploy.config.js');
const {TEST_REWARDS_DISTRIBUTOR_ALLOCATION} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const RewardsDistributor = artifacts.require('RewardsDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    // Test only
    if (network.includes(MAIN_NETWORKS)) {
        return;
    }

    const unit = BigNumber(10 ** 18);
    const antRewardAllocationAmount = unit.times(TEST_REWARDS_DISTRIBUTOR_ALLOCATION);

    const antToken = await AntToken.deployed();
    const distributor = await RewardsDistributor.deployed();

    // Mint enough ANT Tokens for the distributor
    await antToken.mint(accounts[0], antRewardAllocationAmount);

    console.log(`Depositing ${TEST_REWARDS_DISTRIBUTOR_ALLOCATION} Ant Tokens to RewardsDistributor.`);
    await antToken.transfer(distributor.address, antRewardAllocationAmount);

    console.log(`Distributing rewards to all staking pools.`);
    await distributor.distribute();
};
