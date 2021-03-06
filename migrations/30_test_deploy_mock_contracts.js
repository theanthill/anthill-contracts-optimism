/**
 * Deploy Mock contract for testing
 */
const BigNumber = require('bignumber.js');

const {LOCAL_NETWORKS, MAIN_NETWORKS, BSC_NETWORKS} = require('../deploy.config.js');
const {
    TEST_INITIAL_BUSD_SUPPLY,
    TEST_INITIAL_BNB_SUPPLY,
    TEST_INITIAL_ETH_SUPPLY,
    TEST_FAUCET_MAX_REFILL,
    TEST_FAUCET_INITIAL_ALLOCATION,
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    TEST_HQ_ACCOUNT,
} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const MockBUSD = artifacts.require('MockBUSD');
const MockBNB = artifacts.require('MockBNB');
const MockETH = artifacts.require('MockETH');
const MockBandOracle = artifacts.require('MockStdReference');
const TokenFaucet = artifacts.require('TokenFaucet');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    // BUSD
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBUSD, {gas: 80000000});
        const mockBUSD = await MockBUSD.deployed();

        const unit = BigNumber(10 ** 18);
        const busdInitialAllocation = unit.times(TEST_INITIAL_BUSD_SUPPLY);

        await mockBUSD.mint(accounts[0], busdInitialAllocation);
    }

    // BNB
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBNB, {gas: 80000000});
        const mockBNB = await MockBNB.deployed();

        const unit = BigNumber(10 ** 18);
        const bnbInitialAllocation = unit.times(TEST_INITIAL_BNB_SUPPLY);

        await mockBNB.mint(accounts[0], bnbInitialAllocation);
    }

    // ETH
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockETH, {gas: 80000000});
        const mockETH = await MockETH.deployed();

        const unit = BigNumber(10 ** 18);
        const ethInitialAllocation = unit.times(TEST_INITIAL_ETH_SUPPLY);

        await mockETH.mint(accounts[0], ethInitialAllocation);
    }

    // Band Oracle
    await deployer.deploy(MockBandOracle, {gas: 21000000});

    // Faucet
    if (!MAIN_NETWORKS.includes(network)) {
        const faucetMaxRefill = BigNumber(10 ** 18).times(TEST_FAUCET_MAX_REFILL);
        const faucetInitialAllocation = BigNumber(10 ** 18).times(TEST_FAUCET_INITIAL_ALLOCATION);

        const antToken = await AntToken.deployed();
        const mockBUSD = await MockBUSD.deployed();

        let nativeToken = BSC_NETWORKS.includes(network) ? await MockBNB.deployed() : await MockETH.deployed();

        await deployer.deploy(
            TokenFaucet,
            antToken.address,
            mockBUSD.address,
            nativeToken.address,
            faucetMaxRefill,
            [TEST_TREASURY_ACCOUNT, TEST_OPERATOR_ACCOUNT, TEST_ADMIN_ACCOUNT, TEST_HQ_ACCOUNT],
            {gas: 37000000}
        );
        const tokenFaucet = await TokenFaucet.deployed();

        await mockBUSD.mint(tokenFaucet.address, faucetInitialAllocation);
        await nativeToken.mint(tokenFaucet.address, faucetInitialAllocation);
        await antToken.mint(tokenFaucet.address, faucetInitialAllocation);
    }
}

module.exports = migration;
