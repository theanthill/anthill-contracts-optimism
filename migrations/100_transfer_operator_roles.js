/**
 * Transfer operator and ownership of the deployed contracts
 */
 
const {TREASURY_ACCOUNT, TEST_TREASURY_ACCOUNT} = require('./migration-config');
const {MAIN_NETWORKS} = require('../deploy.config.ts');

// ============ Contracts ============
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Timelock = artifacts.require('Timelock');
const RewardsDistributor = artifacts.require('RewardsDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    console.log(`Assigning Treasury governance roles`);
    await assignOperator(Treasury, [AntToken, AntShare, AntBond, Boardroom]);

    console.log(`Assigning Timelock governance roles`);
    await assignOperator(Timelock, [Treasury]);
};

// ============ Helper Functions ============
async function assignOperator(operator, contracts)
{
    const operatorDeployed = await operator.deployed();
    
    for await (const Contract of contracts) {
        const contract = await Contract.deployed();

        console.log(`  - ${operator.contractName} (${operatorDeployed.address}) as ${Contract.contractName} (${contract.address}) Operator`);
        await contract.transferOperator(operatorDeployed.address);
    }
}
