/**
 * Deploys all governance contracts
 */
const {TREASURY_ACCOUNT, ADMIN_ACCOUNT, TEST_TREASURY_ACCOUNT, TEST_ADMIN_ACCOUNT} = require('./migration-config');
const {ORACLE_START_DATE, TREASURY_START_DATE, MAIN_NETWORKS} = require('../deploy.config.ts');
const {getPancakeFactory, getBUSD, getBandOracle} = require('./external-contracts');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Oracle = artifacts.require('Oracle');
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const ContributionPool = artifacts.require('ContributionPool');
const Timelock = artifacts.require('Timelock');

const DAY = 86400;

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();
    const pancakeswap = await getPancakeFactory(network);
    const bandOracle = await getBandOracle(network);
    const BUSD = await getBUSD(network);
    
    // Deploy all governance contracts
    await deployer.deploy(Boardroom, antToken.address, antShare.address);
    await deployer.deploy(Oracle, pancakeswap.address, antToken.address, BUSD.address, DAY, ORACLE_START_DATE, bandOracle.address);
    await deployer.deploy(ContributionPool);
    await deployer.deploy(Treasury, antToken.address, AntBond.address, AntShare.address, Oracle.address, Boardroom.address, ContributionPool.address, TREASURY_START_DATE);

    // And one Timelock to rule them all
    let admins;
    if (network.includes(MAIN_NETWORKS)) {
        admins = [TREASURY_ACCOUNT, ADMIN_ACCOUNT];
    } else {
        admins = [TEST_TREASURY_ACCOUNT, TEST_ADMIN_ACCOUNT];
    }

    console.log(`Deploying Timelock with Treasury account (${admins[0]}) and Admin account (${admins[1]}) as both proposers and executors`)
    await deployer.deploy(Timelock, 2 * DAY, admins);
}

module.exports = migration;
