/**
 * Transfer tokens to Treasury
 */
const BigNumber = require('bignumber.js');

const {TREASURY_ANTS_ALLOCATION} = require('./migration-config');

const AntShare = artifacts.require('AntShare');
const Treasury = artifacts.require('Treasury');

async function migration(deployer, network, accounts) {
    const antShare = await AntShare.deployed();
    const treasury = await Treasury.deployed();

    const unit = BigNumber(10 ** 18);
    const treasuryANTSAllocation = unit.times(TREASURY_ANTS_ALLOCATION);

    console.log('Transferring ' + TREASURY_ANTS_ALLOCATION + ' Ant Shares to Treasury');
    await antShare.transfer(treasury.address, treasuryANTSAllocation);

}
module.exports = migration;
