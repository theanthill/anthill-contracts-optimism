/**
 * Transfer reward distributor roles
 */
 
const {TREASURY_ACCOUNT, TEST_TREASURY_ACCOUNT} = require('./migration-config');
const {MAIN_NETWORKS} = require('../deploy.config.ts');

// ============ Contracts ============
const RewardsDistributor = artifacts.require('RewardsDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    // [workerant] TODO
/*    if (network.includes(MAIN_NETWORKS)) {
        await assignRewardDistributor("Treasury Account", TREASURY_ACCOUNT, [RewardsDistributor])
    } else {
        await assignRewardDistributor("Treasury Account", TEST_TREASURY_ACCOUNT, [RewardsDistributor])
    }*/
};

// ============ Helper Functions ============
async function assignRewardDistributor(distributorName, distributorAddress, contracts)
{   
    for await (const Contract of contracts) {
        const contract = await Contract.deployed();

        console.log(`  - ${distributorName} (${distributorAddress}) as ${Contract.contractName} (${contract.address}) Reward Distributor`);
        await contract.transferRewardsDistributor(distributorAddress);
    }
}
