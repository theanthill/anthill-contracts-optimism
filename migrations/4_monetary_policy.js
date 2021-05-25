const {ANTBUSD_INITIAL_ANT_ALLOCATION} = require('../migrations/migration-config');
const {ORACLE_START_DATE, TREASURY_START_DATE} = require('../deploy.config.ts');
const {getPancakeFactory, getPancakeRouter, getBUSD, getBandOracle} = require('./external-contracts');

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
    const busd = await getBUSD(network);

    // Provide liquidity to ANT-BUSD pair
    const unit = web3.utils.toBN(10 ** 18);
    const amountANTForPool = unit.muln(ANTBUSD_INITIAL_ANT_ALLOCATION);

    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();

    console.log('Approving PancakeSwap on tokens for liquidity');
    await Promise.all([approveIfNot(antToken, accounts[0], pancakeswapRouter.address, amountANTForPool), approveIfNot(busd, accounts[0], pancakeswapRouter.address, amountANTForPool)]);

    // WARNING: msg.sender must hold enough BUSD to add liquidity to
    // ANT-BUSD pool otherwise transaction will revert
    console.log('Adding liquidity to pools');
    await pancakeswapRouter.addLiquidity(antToken.address, busd.address, amountANTForPool, amountANTForPool, amountANTForPool, amountANTForPool, accounts[0], deadline());

    // Deploy boardroom
    await deployer.deploy(Boardroom, antToken.address, antShare.address);
    await deployer.deploy(Oracle, pancakeswap.address, antToken.address, busd.address, DAY, ORACLE_START_DATE, bandOracle.address);
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
