/**
 * Accessor functions for external contracts that may be mocked depending on the deployment network
 */

const knownContracts = require('./known-contracts');
const {LOCAL_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.js');
const PositionManager = artifacts.require('INonfungiblePositionManager');
const SwapFactory = artifacts.require('IUniswapV3FactoryWrap');
const SwapRouter = artifacts.require('ISwapRouterWrap');
const MockBUSD = artifacts.require('MockBUSD');
const MockBNB = artifacts.require('MockBNB');
const MockETH = artifacts.require('MockETH');
const MockBandOracle = artifacts.require('MockStdReference');
const IERC20 = artifacts.require('IERC20');
const AntToken = artifacts.require('AntToken');
const AntShare = artifacts.require('AntShare');
const AntBond = artifacts.require('AntBond');

async function getPositionManager(network) {
    return await PositionManager.at(knownContracts.PositionManager[network]);
}

async function getSwapFactory(network) {
    return await SwapFactory.at(knownContracts.SwapFactory[network]);
}

async function getSwapRouter(network) {
    return await SwapRouter.at(knownContracts.SwapRouter[network]);
}

async function getBUSD(network) {
    return MAIN_NETWORKS.includes(network) ? await IERC20.at(knownContracts.BUSD[network]) : await MockBUSD.deployed();
}

async function getBNB(network) {
    return MAIN_NETWORKS.includes(network) ? await IERC20.at(knownContracts.BNB[network]) : await MockBNB.deployed();
}

async function getETH(network) {
    return MAIN_NETWORKS.includes(network) ? await IERC20.at(knownContracts.ETH[network]) : await MockETH.deployed();
}

async function getBandOracle(network) {
    return await MockBandOracle.deployed();
}

async function getTokenContract(tokenName, network) {
    // function exists
    switch (tokenName) {
        case 'AntToken':
            return await AntToken.deployed();
        case 'AntShare':
            return await AntShare.deployed();
        case 'AntBond':
            return await AntBond.deployed();
        case 'BUSD':
            return await getBUSD(network);
        case 'BNB':
            return await getBNB(network);
        case 'ETH':
            return await getETH(network);
        default:
            throw 'getTokenContract: Token contract not found: ' + tokenName;
    }
}

module.exports = {
    getSwapFactory,
    getSwapRouter,
    getBUSD,
    getBNB,
    getETH,
    getBandOracle,
    getTokenContract,
};
