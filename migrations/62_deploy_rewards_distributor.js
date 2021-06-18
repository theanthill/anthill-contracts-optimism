/**
 * Deployment of the initial reward distributor for each pool that generates ANT Tokens as rewards
 */
const {ANTBUSDLPTokenPool, ANTBNBLPTokenPool} = require('./migration-config');

const AntToken = artifacts.require('AntToken');
const RewardsDistributor = artifacts.require('RewardsDistributor');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();

    const poolsConfig = [ANTBUSDLPTokenPool, ANTBNBLPTokenPool];
    const poolsContracts = poolsConfig.map(({contractName}) => artifacts.require(contractName));
    const poolsAddresses = poolsContracts.map((p) => p.address);

    await deployer.deploy(RewardsDistributor, antToken.address, poolsAddresses);
    const distributor = await RewardsDistributor.deployed();

    // Transfer each staking pool to the deployed rewards distributor
    for await (const poolContract of poolsContracts) {
        console.log(`Setting ${poolContract.contractName} distributor to RewardsDistributor (${distributor.address})`);

        const pool = await poolContract.deployed();
        await pool.transferRewardsDistributor(distributor.address);
    }
};
