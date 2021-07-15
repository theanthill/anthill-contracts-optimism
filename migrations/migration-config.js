/**
 * Configuration for the ANT token migration
 */

// Amount of Ant Shares allocated for Treasury at deploy
const TREASURY_ANT_ALLOCATION = 5000000;

// Maximum total amount of Ant Shares to be pre-minted
const MAX_ANTS_SUPPLY = 21000000;

// ANT-BUSD LP Tokens pool that generate ANT Token rewards
const ANTBUSDLPTokenPool = {
    contractName: 'BUSDANTLPTokenANTPool',
    helperContract: 'BUSDANTLPHelper',
    mainToken: 'AntToken',
    otherToken: 'BUSD',
};

// ANT-BNB LP Tokens pool that generate ANT Token rewards
const ANTBNBLPTokenPool = {
    contractName: 'BNBANTLPTokenANTPool',
    helperContract: 'BNBANTLPHelper',
    mainToken: 'AntToken',
    otherToken: 'BNB',
};

// ANT-ETH LP Tokens pool that generate ANT Token rewards
const ANTETHLPTokenPool = {
    contractName: 'ETHANTLPTokenANTPool',
    helperContract: 'ETHANTLPHelper',
    mainToken: 'AntToken',
    otherToken: 'ETH',
};

const INITIAL_BSC_DEPLOYMENT_POOLS = [ANTBUSDLPTokenPool, ANTBNBLPTokenPool];
const INITIAL_ETH_DEPLOYMENT_POOLS = [ANTBUSDLPTokenPool, ANTETHLPTokenPool];

// System accounts
//
// [workerant] Set the final values before mainnet deployment
const TREASURY_ACCOUNT = '';
const OPERATOR_ACCOUNT = '';
const ADMIN_ACCOUNT = '';

/**
 * Test configuration
 */
// HQ Account used for testing
const TEST_TREASURY_ACCOUNT = '0xF9D5169aA864C1Ddda2Aba931Edf722f98B2D159';
const TEST_OPERATOR_ACCOUNT = '0x8a612956aBAF09C37e4372d7890835294080eb30';
const TEST_ADMIN_ACCOUNT = '0xF9D5169aA864C1Ddda2Aba931Edf722f98B2D159';
const TEST_HQ_ACCOUNT = '0x47Ce08590BdB1162EaDE736EfaAbf2aa2d5C8C92';

// Amount of Ant Shares allocated for HQ at deploy
const TEST_HQ_ANTS_ALLOCATION = 2100000;

// Amount of Ant Tokens allocated for HQ at deploy
const TEST_HQ_ANT_ALLOCATION = 100000;

// Amount of fake BNB tokens to be minted at deploy
const TEST_INITIAL_BNB_SUPPLY = 1000;

// Amount of fake ETH tokens to be minted at deploy
const TEST_INITIAL_ETH_SUPPLY = 1000;

// Amount of fake BUSD tokens to be minted at deploy
const TEST_INITIAL_BUSD_SUPPLY = 300000;

// Amount of Ant Tokens allocated for the ANTBUSD liquidity pool
const TEST_ANT_LIQUIDITY_PER_POOL = 50000;

// Maximum amount of tokens to refill from faucet
const TEST_FAUCET_MAX_REFILL = 100;

// Maximum amount of tokens to refill from faucet
const TEST_FAUCET_INITIAL_ALLOCATION = 500000;

// Initial Ant Token rewards allocation
const TEST_REWARDS_DISTRIBUTOR_ALLOCATION = 100000;

module.exports = {
    TREASURY_ANT_ALLOCATION,
    MAX_ANTS_SUPPLY,
    ANTBUSDLPTokenPool,
    ANTBNBLPTokenPool,
    INITIAL_BSC_DEPLOYMENT_POOLS,
    INITIAL_ETH_DEPLOYMENT_POOLS,
    TREASURY_ACCOUNT,
    OPERATOR_ACCOUNT,
    ADMIN_ACCOUNT,
    // TEST
    TEST_TREASURY_ACCOUNT,
    TEST_OPERATOR_ACCOUNT,
    TEST_ADMIN_ACCOUNT,
    TEST_HQ_ACCOUNT,
    TEST_INITIAL_BUSD_SUPPLY,
    TEST_INITIAL_BNB_SUPPLY,
    TEST_INITIAL_ETH_SUPPLY,
    TEST_ANT_LIQUIDITY_PER_POOL,
    TEST_HQ_ANT_ALLOCATION,
    TEST_HQ_ANTS_ALLOCATION,
    TEST_FAUCET_MAX_REFILL,
    TEST_FAUCET_INITIAL_ALLOCATION,
    TEST_REWARDS_DISTRIBUTOR_ALLOCATION,
};
