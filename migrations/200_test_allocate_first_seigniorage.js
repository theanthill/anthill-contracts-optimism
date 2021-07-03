/**
 * Transfer operator and ownership of the deployed contracts
 */

const {MAIN_NETWORKS} = require('../deploy.config.js');

// ============ Contracts ============
const Treasury = artifacts.require('Treasury');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    // Mainnet
    if (network.includes(MAIN_NETWORKS)) {
        return;
    }

    const treasury = await Treasury.deployed();

    console.log(`Allocating first Seignorage`);
    await treasury.allocateSeigniorage();
    await treasury.allocateSeigniorage(); // [workerant] Not sure why twice
};
