const {ORACLE_START_DATE, TREASURY_START_DATE} = require('../deploy.config.ts');
const {getPancakeFactory, getBUSD, getBandOracle} = require('./external-contracts');

const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Oracle = artifacts.require('Oracle');
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const SimpleERCFund = artifacts.require('SimpleERCFund');

const DAY = 86400;

async function migration(deployer, network) {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();
    const pancakeswap = await getPancakeFactory(network);
    const bandOracle = await getBandOracle(network);
    const BUSD = await getBUSD(network);

    // Deploy boardroom
    await deployer.deploy(Boardroom, antToken.address, antShare.address);
    await deployer.deploy(Oracle, pancakeswap.address, antToken.address, BUSD.address, DAY, ORACLE_START_DATE, bandOracle.address);
    await deployer.deploy(SimpleERCFund);
    await deployer.deploy(Treasury, antToken.address, AntBond.address, AntShare.address, Oracle.address, Boardroom.address, SimpleERCFund.address, TREASURY_START_DATE);
}

module.exports = migration;
