/**
 * Deploy Mock contract for testing
 */
const BigNumber = require('bignumber.js');

const {LOCAL_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.ts');
const {INITIAL_ANT_SUPPLY, INITIAL_BNB_SUPPLY, FAUCET_MAX_REFILL, FAUCET_INITIAL_ALLOCATION} = require('../migrations/migration-config');

const AntToken = artifacts.require('AntToken');
const MockBUSD = artifacts.require('MockBUSD');
const MockBNB = artifacts.require('MockBNB');
const MockBandOracle = artifacts.require('MockStdReference');
const TokenFaucet = artifacts.require('TokenFaucet');
const PancakeFactory = artifacts.require('PancakeFactory');
const PancakeRouter = artifacts.require('PancakeRouter');

async function migration(deployer, network, accounts) {
    // BUSD
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBUSD);
        const mockBUSD = await MockBUSD.deployed();

        const unit = BigNumber(10 ** 18);
        const busdInitialAllocation = unit.times(INITIAL_ANT_SUPPLY);

        await mockBUSD.mint(accounts[0], busdInitialAllocation);
    }

    // BNB
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBNB);
        const mockBNB = await MockBNB.deployed();

        const unit = BigNumber(10 ** 18);
        const bnbInitialAllocation = unit.times(INITIAL_BNB_SUPPLY);

        await mockBNB.mint(accounts[0], bnbInitialAllocation);
    }

    // Band Oracle
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBandOracle);
    }

    // Faucet
    if (!MAIN_NETWORKS.includes(network)) {
        const faucetMaxRefill = BigNumber(10 ** 18).times(FAUCET_MAX_REFILL);
        const faucetInitialAllocation = BigNumber(10 ** 18).times(FAUCET_INITIAL_ALLOCATION);

        const antToken = await AntToken.deployed();
        const mockBUSD = await MockBUSD.deployed();
        const mockBNB = await MockBNB.deployed();

        await deployer.deploy(TokenFaucet, antToken.address, mockBUSD.address, mockBNB.address, faucetMaxRefill);
        const tokenFaucet = await TokenFaucet.deployed();

        await mockBUSD.mint(tokenFaucet.address, faucetInitialAllocation);
        await mockBNB.mint(tokenFaucet.address, faucetInitialAllocation);
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
