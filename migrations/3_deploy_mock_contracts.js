/**
 * Deploy Mock contract for testing
 */
const {LOCAL_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.ts');
const {INITIAL_ANT_SUPPLY, FAUCET_MAX_REFILL, FAUCET_INITIAL_ALLOCATION} = require('../migrations/migration-config');

const MockBUSD = artifacts.require('MockBUSD');
const MockBandOracle = artifacts.require('MockStdReference');
const TokenFaucet = artifacts.require('TokenFaucet');
const PancakeFactory = artifacts.require('PancakeFactory');
const PancakeRouter = artifacts.require('PancakeRouter');

const AntToken = artifacts.require('AntToken');

async function migration(deployer, network, accounts) {
    // BUSD
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBUSD);
        const mockBUSD = await MockBUSD.deployed();

        const unit = web3.utils.toBN(10 ** 18);
        const busdInitialAllocation = unit.muln(INITIAL_ANT_SUPPLY);

        await mockBUSD.mint(accounts[0], busdInitialAllocation);
    }

    // Band Oracle
    if (!MAIN_NETWORKS.includes(network)) {
        await deployer.deploy(MockBandOracle);
    }

    if (!MAIN_NETWORKS.includes(network)) {
        const faucetMaxRefill = web3.utils.toBN(10 ** 18).muln(FAUCET_MAX_REFILL);
        const faucetInitialAllocation = web3.utils.toBN(10 ** 18).muln(FAUCET_INITIAL_ALLOCATION);

        const antToken = await AntToken.deployed();
        const mockBUSD = await MockBUSD.deployed();

        await deployer.deploy(TokenFaucet, antToken.address, mockBUSD.address, faucetMaxRefill);
        const tokenFaucet = await TokenFaucet.deployed();

        await mockBUSD.mint(tokenFaucet.address, faucetInitialAllocation);
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
