/**
 * Deploys ANT, ANTS and ANTB tokens
 */

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');

// ============ Main Migration ============
const migration = async (deployer, network, accounts) => {
    await deployer.deploy(AntToken);
    await deployer.deploy(AntShare);
    await deployer.deploy(AntBond);
};

module.exports = migration;
