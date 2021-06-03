const {POOLS_INITIAL_ANT_ALLOCATION} = require('../migrations/migration-config');
const {ORACLE_START_DATE, TREASURY_START_DATE} = require('../deploy.config.ts');
const {getPancakeFactory, getPancakeRouter, getBUSD, getBNB, getBandOracle} = require('./external-contracts');

const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Oracle = artifacts.require('Oracle');
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const SimpleERCFund = artifacts.require('SimpleERCFund');

const DAY = 86400;

async function migration(deployer, network, accounts) {
    const pancakeswap = await getPancakeFactory(network);
    const pancakeswapRouter = await getPancakeRouter(network);
    const bandOracle = await getBandOracle(network);
    const BUSD = await getBUSD(network);
    const BNB = await getBNB(network);

    // Provide liquidity to ANT-BUSD pair
    const unit = web3.utils.toBN(10 ** 18);
    const amountANTForPool = unit.muln(POOLS_INITIAL_ANT_ALLOCATION);
    const amountANTToApprove = amountANTForPool.muln(2 /* Number of pools */);
    const amountBUSDForPool = unit.muln(POOLS_INITIAL_ANT_ALLOCATION);
    const amountBNBForPool = unit.muln(POOLS_INITIAL_ANT_ALLOCATION);

    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();

    console.log('Approving PancakeSwap on tokens for liquidity');
    await Promise.all([approveIfNot(antToken, accounts[0], pancakeswapRouter.address, amountANTToApprove),
                       approveIfNot(BUSD, accounts[0], pancakeswapRouter.address, amountBUSDForPool),
                       approveIfNot(BNB, accounts[0], pancakeswapRouter.address, amountBNBForPool)]);

    // WARNING: msg.sender must hold enough BUSD to add liquidity to
    // ANT-BUSD pool otherwise transaction will revert
    console.log('Adding liquidity to pools');
    await pancakeswapRouter.addLiquidity(antToken.address, BUSD.address, amountANTForPool, amountANTForPool, amountBUSDForPool, amountBUSDForPool, accounts[0], deadline());
    await pancakeswapRouter.addLiquidity(antToken.address, BNB.address, amountANTForPool, amountANTForPool, amountBNBForPool, amountBNBForPool, accounts[0], deadline());

    // Deploy boardroom
    await deployer.deploy(Boardroom, antToken.address, antShare.address);
    await deployer.deploy(Oracle, pancakeswap.address, antToken.address, BUSD.address, DAY, ORACLE_START_DATE, bandOracle.address);
    await deployer.deploy(SimpleERCFund);
    await deployer.deploy(Treasury, antToken.address, AntBond.address, AntShare.address, Oracle.address, Boardroom.address, SimpleERCFund.address, TREASURY_START_DATE);
}

async function approveIfNot(token, owner, spender, amount) {
    const allowance = await token.allowance(owner, spender);
    if (web3.utils.toBN(allowance).gte(web3.utils.toBN(amount))) {
        return;
    }
    await token.approve(spender, amount);
    console.log(` - Approved ${token.symbol ? await token.symbol() : token.address}`);
}

function deadline() {
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

module.exports = migration;
