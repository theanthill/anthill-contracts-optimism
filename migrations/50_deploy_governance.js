/**
 * Deploys all governance contracts
 */
const {
    TREASURY_ACCOUNT,
    OPERATOR_ACCOUNT,
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
} = require('./migration-config');
const {
    ORACLE_START_DATE,
    TREASURY_START_DATE,
    MAIN_NETWORKS,
    ORACLE_PERIOD,
    TREASURY_PERIOD,
    TREASURY_TIMELOCK_PERIOD,
    OPERATOR_TIMELOCK_PERIOD,
    LIQUIDITY_FEE,
} = require('../deploy.config.js');
const {getSwapFactory, getBUSD, getBandOracle} = require('./external-contracts');

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

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const antBond = await AntBond.deployed();
    const antShare = await AntShare.deployed();
    const swapFactory = await getSwapFactory(network);
    const bandOracle = await getBandOracle(network);
    const BUSD = await getBUSD(network);

    // Get the ANT/BUSD pair
    const ANTBUSDPair = await swapFactory.getPool(antToken.address, BUSD.address, LIQUIDITY_FEE);

    // Deploy all governance contracts
    await deployer.deploy(Boardroom, antToken.address, antShare.address, {gas: 100000000});
    await deployer.deploy(Oracle, ANTBUSDPair, ORACLE_PERIOD, ORACLE_START_DATE, bandOracle.address);
    await deployer.deploy(ContributionPool);
    await deployer.deploy(
        Treasury,
        antToken.address,
        antBond.address,
        antShare.address,
        Oracle.address,
        Boardroom.address,
        ContributionPool.address,
        TREASURY_START_DATE,
        TREASURY_PERIOD,
        {gas: 100000000}
    );

    // Timelocks
    let adminAccount = network.includes(MAIN_NETWORKS) ? TREASURY_ACCOUNT : TEST_TREASURY_ACCOUNT;
    console.log(
        `Deploying ${TreasuryTimelock.contractName} for account Treasury (${adminAccount}) as both proposer and executor`
    );
    await deployer.deploy(TreasuryTimelock, TREASURY_TIMELOCK_PERIOD, [adminAccount]);

    adminAccount = network.includes(MAIN_NETWORKS) ? OPERATOR_ACCOUNT : TEST_OPERATOR_ACCOUNT;
    console.log(
        `Deploying ${OperatorTimelock.contractName} for account Operator (${adminAccount}) as both proposer and executor`
    );
    await deployer.deploy(OperatorTimelock, OPERATOR_TIMELOCK_PERIOD, [adminAccount]);
}

module.exports = migration;
