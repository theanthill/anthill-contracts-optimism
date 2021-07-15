/**
 * Add liquidity to PancakeSwap only if we are on the Testnet. On the Mainnet the liquidity
 * will be added manually by HQ
 */
const BigNumber = require('bignumber.js');

const {MAIN_NETWORKS} = require('../deploy.config.js');
const {
    TEST_ANT_LIQUIDITY_PER_POOL,
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');
const {getTokenContract, getPancakeRouter, getBandOracle} = require('./external-contracts');

// ============ Contracts ============
const Oracle = artifacts.require('Oracle');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    // Test only
    if (network.includes(MAIN_NETWORKS)) {
        return;
    }

    const pancakeRouter = await getPancakeRouter(network);
    const bandOracle = await getBandOracle(network);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        console.log(`Liquidity for the ${pool.mainToken}/${pool.otherToken} staking pool`);
        await addLiquidity(network, accounts[0], pool, pancakeRouter, bandOracle, TEST_ANT_LIQUIDITY_PER_POOL);
    }
}

// ============ Helper Functions ============
async function addLiquidity(network, account, pool, router, oracle, initialAllocation) {
    const mainToken = await getTokenContract(pool.mainToken, network);
    const otherToken = await getTokenContract(pool.otherToken, network);

    // Get the price rate
    const otherTokenRate = await oracle.getReferenceData(pool.otherToken, 'BUSD');
    const priceOtherToken = BigNumber(otherTokenRate.rate);

    const unit = BigNumber(10 ** 18);

    let mainTokenAmount = unit.times(initialAllocation);
    let otherTokenAmount = unit.times(initialAllocation).times(unit).idiv(priceOtherToken);

    // Mint some tokens for adding liquidity
    await mainToken.mint(account, mainTokenAmount);
    await otherToken.mint(account, otherTokenAmount);

    // Approve the expense for the router
    console.log(`  - Approving ${pool.mainToken} token for ${getDisplayBalance(mainTokenAmount)} tokens`);
    console.log(`  - Approving ${pool.otherToken} token for ${getDisplayBalance(otherTokenAmount)} tokens`);
    await Promise.all([
        approveIfNot(mainToken, account, router.address, mainTokenAmount),
        approveIfNot(otherToken, account, router.address, otherTokenAmount),
    ]);

    console.log(
        `  - Adding liquidity for the ${pool.mainToken}/${pool.otherToken} pool (${getDisplayBalance(
            mainTokenAmount
        )}/${getDisplayBalance(otherTokenAmount)})`
    );
    await router.addLiquidity(
        mainToken.address,
        otherToken.address,
        mainTokenAmount,
        otherTokenAmount,
        mainTokenAmount,
        otherTokenAmount,
        account,
        deadline()
    );
}

async function approveIfNot(token, owner, spender, amount) {
    const allowance = await token.allowance(owner, spender);
    if (BigNumber(allowance).gte(BigNumber(amount))) {
        return;
    }
    await token.approve(spender, amount);
    console.log(
        `    - Approved ${token.symbol ? await token.symbol() : token.address} for ${getDisplayBalance(amount)} tokens`
    );
}

function deadline() {
    // 30 minutes
    return Math.floor(new Date().getTime() / 1000) + 1800;
}

function getDisplayBalance(amount) {
    const unit = BigNumber(10 ** 18);
    return amount.div(unit).toFormat(2);
}

module.exports = migration;
