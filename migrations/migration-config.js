/**
 * Configuration for the ANT token migration
 */

// Amount of Ant Tokens to be minted at deploy
const INITIAL_ANT_SUPPLY = 500000;

// Amount of Ant Tokens allocated for the ANTBUSD liquidity pool
const POOLS_INITIAL_ANT_ALLOCATION = 50000;

// Amount of Ant Tokens allocated for Treasury at deploy
const TREASURY_INITIAL_ANT_ALLOCATION = 100000;

// Amount of Ant Tokens allocated as rewards for the ANTBUSD liquidity pool stake holders
const ANTBUSD_POOL_ANT_REWARD_ALLOCATION = 100000;

// Maximum total amount of Ant Shares to be pre-minted
const MAX_ANTS_SUPPLY = 21000000;

// Amount of Ant Shares allocated for Treasury at deploy
const TREASURY_ANTS_ALLOCATION = 18900000;

// Maximum amount of tokens to refill from faucet
const FAUCET_MAX_REFILL = 100;

// Maximum amount of tokens to refill from faucet
const FAUCET_INITIAL_ALLOCATION = 500000;

// ANT-BUSD LP Tokens pool that generate ANT Token rewards
const ANTBUSDLPTokenPool = {contractName: 'BUSDANTLPTokenANTPool', token: 'BUSD_ANT-LPv2'};

// ANT-BNB LP Tokens pool that generate ANT Token rewards
const ANTBNBLPTokenPool = {contractName: 'BNBANTLPTokenANTPool', token: 'WBNB_ANT-LPv2'};



module.exports = {
    INITIAL_ANT_SUPPLY,
    POOLS_INITIAL_ANT_ALLOCATION,
    TREASURY_INITIAL_ANT_ALLOCATION,
    ANTBUSD_POOL_ANT_REWARD_ALLOCATION,
    MAX_ANTS_SUPPLY,
    TREASURY_ANTS_ALLOCATION,
    FAUCET_MAX_REFILL,
    FAUCET_INITIAL_ALLOCATION,
    ANTBUSDLPTokenPool,
    ANTBNBLPTokenPool
};
