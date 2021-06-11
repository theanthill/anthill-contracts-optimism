/**
 * Add liquidity for the staking pools
 */
const BigNumber = require('bignumber.js');

const {POOLS_INITIAL_ANT_ALLOCATION, INITIAL_DEPLOYMENT_POOLS} = require('../migrations/migration-config');
const {getTokenContract, getPancakeRouter, getBandOracle} = require('./external-contracts');

const AntToken = artifacts.require('AntToken');

async function migration(deployer, network, accounts) {

    const antToken = await AntToken.deployed();
    const pancakeswapRouter = await getPancakeRouter(network);
    const bandOracle = await getBandOracle(network);

    // [workerant] Review for real deployment, we may do it manually
    for (let pool of INITIAL_DEPLOYMENT_POOLS)
    {
        const referenceDataOtherToken = await bandOracle.getReferenceData(pool.otherToken, "BUSD");
        const otherToken = await getTokenContract(pool.otherToken, network);

        const priceOtherToken = BigNumber(referenceDataOtherToken.rate);

        // Approve amounts for adding liquidity
        const unit = BigNumber(10 ** 18);
        let antTokenAmount = unit.times(POOLS_INITIAL_ANT_ALLOCATION);
        let otherTokenAmount = unit.times(POOLS_INITIAL_ANT_ALLOCATION).idiv(priceOtherToken);

        console.log("Approving ANT token for " + getDisplayBalance(antTokenAmount) + " tokens");
        console.log("Approving " + pool.otherToken + " token for " + getDisplayBalance(otherTokenAmount) + " tokens");
        await Promise.all([approveIfNot(antToken, accounts[0], pancakeswapRouter.address, antTokenAmount),
                           approveIfNot(otherToken, accounts[0], pancakeswapRouter.address, otherTokenAmount)]);

        console.log("Adding liquidity for the ANT/" + pool.otherToken + " pool (" +
                                getDisplayBalance(antTokenAmount) + "/" + getDisplayBalance(otherTokenAmount) + ")");
        await pancakeswapRouter.addLiquidity(antToken.address, otherToken.address,
                                             antTokenAmount, otherTokenAmount,
                                             antTokenAmount, otherTokenAmount,
                                             accounts[0], deadline());
    }
}

async function approveIfNot(token, owner, spender, amount) {
    const allowance = await token.allowance(owner, spender);
    if (BigNumber(allowance).gte(BigNumber(amount))) {
        return;
    }
    await token.approve(spender, amount);
    console.log(` - Approved ${token.symbol ? await token.symbol() : token.address} for ${getDisplayBalance(amount)} tokens`);
}

function deadline() {
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

function getDisplayBalance(amount)
{
    const unit = BigNumber(10 ** 18);
    return amount.div(unit).toFormat(2);
}

module.exports = migration;
