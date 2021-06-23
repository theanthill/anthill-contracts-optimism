/**
 * Deploys all governance contracts
 */
const {TREASURY_ACCOUNT, ADMIN_ACCOUNT, OPERATOR_ACCOUNT,
       TEST_TREASURY_ACCOUNT, TEST_ADMIN_ACCOUNT, TEST_OPERATOR_ACCOUNT} = require('./migration-config');
const {ORACLE_START_DATE, TREASURY_START_DATE, MAIN_NETWORKS} = require('../deploy.config.ts');
const {getPancakeFactory, getBUSD, getBandOracle} = require('./external-contracts');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Oracle = artifacts.require('Oracle');
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const TreasuryTimelock = artifacts.require('TreasuryTimelock');
const OperatorTimelock = artifacts.require('OperatorTimelock');
const ContributionPool = artifacts.require('ContributionPool');

const DAY = 86400;

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();
    const pancakeswap = await getPancakeFactory(network);
    const bandOracle = await getBandOracle(network);
    const BUSD = await getBUSD(network);
    
    // Get the ANT/BUSD pair
    const ANTBUSDPair = await pancakeswap.getPair(antToken.address, BUSD.address);

    // Deploy all governance contracts
    await deployer.deploy(Boardroom, antToken.address, antShare.address);
    await deployer.deploy(Oracle, ANTBUSDPair, DAY, ORACLE_START_DATE, bandOracle.address);
    await deployer.deploy(ContributionPool);
    await deployer.deploy(Treasury, antToken.address, AntBond.address, AntShare.address, Oracle.address, Boardroom.address, ContributionPool.address, TREASURY_START_DATE);

    // Timelocks
    let adminAccount = network.includes(MAIN_NETWORKS) ? TREASURY_ACCOUNT : TEST_TREASURY_ACCOUNT;
    console.log(`Deploying ${TreasuryTimelock.contractName} for account Treasury (${adminAccount}) as both proposer and executor`);
    await deployer.deploy(TreasuryTimelock, 2 * DAY, [adminAccount]);

    adminAccount = network.includes(MAIN_NETWORKS) ? OPERATOR_ACCOUNT : TEST_OPERATOR_ACCOUNT;
    console.log(`Deploying ${OperatorTimelock.contractName} for account Operator (${adminAccount}) as both proposer and executor`);
    await deployer.deploy(OperatorTimelock, 2 * DAY, [adminAccount]);
}

module.exports = migration;
