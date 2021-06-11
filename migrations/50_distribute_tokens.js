/**
 * Transfer tokens to Treasury
 */
const BigNumber = require('bignumber.js');

const {TREASURY_INITIAL_ANT_ALLOCATION, TREASURY_ANTS_ALLOCATION} = require('./migration-config');

const AntToken = artifacts.require('AntToken');
const AntShare = artifacts.require('AntShare');
const Treasury = artifacts.require('Treasury');

async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();
    const treasury = await Treasury.deployed();

    const unit = BigNumber(10 ** 18);
    const trasuryInitialAntAllocation = unit.times(TREASURY_INITIAL_ANT_ALLOCATION);
    const treasuryANTSAllocation = unit.times(TREASURY_ANTS_ALLOCATION);

    console.log('Transferring ' + TREASURY_INITIAL_ANT_ALLOCATION + ' Ant Tokens to Treasury');
    await antToken.transfer(treasury.address, trasuryInitialAntAllocation);

    console.log('Transferring ' + TREASURY_ANTS_ALLOCATION + ' Ant Shares to Treasury');
    await antShare.transfer(treasury.address, treasuryANTSAllocation);

}
module.exports = migration;
