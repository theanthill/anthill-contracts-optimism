/**
 * Deploys ANT, ANTS and ANTB tokens
 */

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    await deployer.deploy(AntToken, {gas: 80000000});
    await deployer.deploy(AntShare, {gas: 80000000});
    await deployer.deploy(AntBond, {gas: 80000000});
};

module.exports = migration;
