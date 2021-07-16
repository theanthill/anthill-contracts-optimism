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
const PancakeFactory = artifacts.require('PancakeFactory');
const PancakeRouter = artifacts.require('PancakeRouter');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    // BUSD
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBUSD);
        const mockBUSD = await MockBUSD.deployed();

        const unit = BigNumber(10 ** 18);
        const busdInitialAllocation = unit.times(TEST_INITIAL_BUSD_SUPPLY);

        await mockBUSD.mint(accounts[0], busdInitialAllocation);
    }

    // BNB
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBNB);
        const mockBNB = await MockBNB.deployed();

        const unit = BigNumber(10 ** 18);
        const bnbInitialAllocation = unit.times(TEST_INITIAL_BNB_SUPPLY);

        await mockBNB.mint(accounts[0], bnbInitialAllocation);
    }

    // ETH
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockETH);
        const mockETH = await MockETH.deployed();

        const unit = BigNumber(10 ** 18);
        const ethInitialAllocation = unit.times(TEST_INITIAL_ETH_SUPPLY);

        await mockETH.mint(accounts[0], ethInitialAllocation);
    }

    // Band Oracle
    if (LOCAL_NETWORKS.includes(network)) {
        await deployer.deploy(MockBandOracle);
    }

    // Faucet
    if (!MAIN_NETWORKS.includes(network)) {
        const faucetMaxRefill = BigNumber(10 ** 18).times(TEST_FAUCET_MAX_REFILL);
        const faucetInitialAllocation = BigNumber(10 ** 18).times(TEST_FAUCET_INITIAL_ALLOCATION);

        const antToken = await AntToken.deployed();
        const mockBUSD = await MockBUSD.deployed();

        let nativeToken = BSC_NETWORKS.includes(network) ? await MockBNB.deployed() : await MockETH.deployed();

        await deployer.deploy(TokenFaucet, antToken.address, mockBUSD.address, nativeToken.address, faucetMaxRefill, [
            TEST_TREASURY_ACCOUNT,
            TEST_OPERATOR_ACCOUNT,
            TEST_ADMIN_ACCOUNT,
            TEST_HQ_ACCOUNT,
        ]);
        const tokenFaucet = await TokenFaucet.deployed();

        await mockBUSD.mint(tokenFaucet.address, faucetInitialAllocation);
        await nativeToken.mint(tokenFaucet.address, faucetInitialAllocation);
        await antToken.mint(tokenFaucet.address, faucetInitialAllocation);
    }

    // PancakeSwap
    if (LOCAL_NETWORKS.includes(network)) {
        await deployer.deploy(PancakeFactory, accounts[0]);
        const pancakeFactory = await PancakeFactory.deployed();
        await deployer.deploy(PancakeRouter, pancakeFactory.address, accounts[0]);
    }
}

module.exports = migration;
