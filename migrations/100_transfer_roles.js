/**
 * Transfer operator and ownership of the deployed contracts
 */

const {
    TREASURY_ACCOUNT,
    TEST_TREASURY_ACCOUNT,
    ADMIN_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
} = require('./migration-config');

const {MAIN_NETWORKS, BSC_NETWORKS} = require('../deploy.config');

// ============ Contracts ============
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const TreasuryTimelock = artifacts.require('TreasuryTimelock');
const OperatorTimelock = artifacts.require('OperatorTimelock');
const ContributionPool = artifacts.require('ContributionPool');
const RewardsDistributor = artifacts.require('RewardsDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    treasury = await Treasury.deployed();
    treasuryTimelock = await TreasuryTimelock.deployed();
    operatorTimelock = await OperatorTimelock.deployed();

    // Operator
    console.log(`Assigning Treasury contract governance roles`);
    await assignOperator(Treasury.contractName, treasury.address, [AntToken, AntShare, AntBond, Boardroom]);

    console.log(`Assigning Treasury Timelock contract governance roles`);
    await assignOperator(TreasuryTimelock.contractName, treasuryTimelock.address, [
        ContributionPool,
        RewardsDistributor,
    ]);

    console.log(`Assigning Operator Timelock contract governance roles`);
    await assignOperator(OperatorTimelock.contractName, operatorTimelock.address, [Treasury]);

    console.log(`Assigning Treasury account governance roles`);
    if (network.includes(MAIN_NETWORKS)) {
        await assignOperator('Treasury account', TREASURY_ACCOUNT, [RewardsDistributor]);
    } else {
        await assignOperator('Treasury account', TEST_TREASURY_ACCOUNT, [RewardsDistributor]);
    }

    // Admin
    console.log(`Assigning Admin role`);
    const adminAccount = network.includes(MAIN_NETWORKS) ? ADMIN_ACCOUNT : TEST_ADMIN_ACCOUNT;
    let adminContracts = [
        AntToken,
        AntShare,
        AntBond,
        Treasury,
        Boardroom,
        TreasuryTimelock,
        ContributionPool,
        RewardsDistributor,
    ];

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        adminContracts.push(artifacts.require(pool.contractName));
    }

    await assignAdmin('Admin Account', adminAccount, adminContracts);
};

// ============ Helper Functions ============
async function assignOperator(operatorName, operatorAddress, contracts) {
    for await (const Contract of contracts) {
        const contract = await Contract.deployed();

        console.log(
            `  - ${operatorName} (${operatorAddress}) as ${Contract.contractName} (${contract.address}) Operator`
        );
        await contract.transferOperator(operatorAddress);
    }
}

async function assignAdmin(accountName, accountAddress, contracts) {
    for await (const Contract of contracts) {
        const contract = await Contract.deployed();

        console.log(`  - ${accountName} (${accountAddress}) as ${Contract.contractName} (${contract.address}) Admin`);
        await contract.transferAdmin(accountAddress);
    }
}
