/**
 * Deploys ANT, ANTS and ANTB tokens
 */
const {INITIAL_ANT_SUPPLY, MAX_ANTS_SUPPLY} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    const initialAntTokenSupply = web3.utils.toBN(10 ** 18).muln(INITIAL_ANT_SUPPLY);
    const maxAntSharesSupply = web3.utils.toBN(10 ** 18).muln(MAX_ANTS_SUPPLY);

    await deployer.deploy(AntToken, initialAntTokenSupply);
    await deployer.deploy(AntShare, maxAntSharesSupply);
    await deployer.deploy(AntBond);
};

module.exports = migration;
