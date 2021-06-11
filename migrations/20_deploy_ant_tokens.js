/**
 * Deploys ANT, ANTS and ANTB tokens
 */
const BigNumber = require('bignumber.js');

const {INITIAL_ANT_SUPPLY, MAX_ANTS_SUPPLY} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    const initialAntTokenSupply = BigNumber(10 ** 18).times(INITIAL_ANT_SUPPLY);
    const maxAntSharesSupply = BigNumber(10 ** 18).times(MAX_ANTS_SUPPLY);

    await deployer.deploy(AntToken, initialAntTokenSupply);
    await deployer.deploy(AntShare, maxAntSharesSupply);
    await deployer.deploy(AntBond);
};

module.exports = migration;
