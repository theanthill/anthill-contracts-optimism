// const POOL_START_DATE     = Math.round(Date.now() / 1000) + 1 * 60 * 60;
// const ORACLE_START_DATE   = Math.round(Date.now() / 1000) + 1 * 60 * 120;
// const TREASURY_START_DATE = Math.round(Date.now() / 1000) + 1 * 60 * 120;

// [workerant] Set the final values before mainnet deployment

// Start dates
const POOL_START_DATE = 1619777245; // 01/14/2021 @ 4:00am (UTC)
const ORACLE_START_DATE = 1619777245; // 01/19/2021 @ 4:00am (UTC)
const TREASURY_START_DATE = 1619777245; // 01/21/2021 @ 4:00am (UTC)

// Epoch periods
const POOL_PERIOD = 600; // 10 minutes
const ORACLE_PERIOD = 86400; // 1 Day
const TREASURY_PERIOD = 600; // 1 Day

// Timelocks
const TREASURY_TIMELOCK_PERIOD = 2 * 86400; // 2 Days
const OPERATOR_TIMELOCK_PERIOD = 2 * 86400; // 2 Days

// PancakeSwap Factory
const UNI_FACTORY = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';

// Real networks with already deployed Swaps and BUSD
const LOCAL_NETWORKS = ['dev'];
const TEST_NETWORKS = ['bsc-testnet', 'bsc-local-testnet', 'eth-ropsten', 'eth-local-ropsten'];
const MAIN_NETWORKS = ['bsc-mainnet', 'bsc-local-mainnet', 'eth-mainnet', 'eth-local-mainnet'];
const BSC_NETWORKS = ['bsc-testnet', 'bsc-local-testnet', 'bsc-mainnet', 'bsc-local-mainnet'];
const ETH_NETWORKS = ['eth-ropsten', 'eth-local-ropsten', 'eth-mainnet', 'eth-local-mainnet'];

module.exports = {
    POOL_START_DATE,
    POOL_PERIOD,
    ORACLE_START_DATE,
    ORACLE_PERIOD,
    TREASURY_START_DATE,
    TREASURY_PERIOD,
    TREASURY_TIMELOCK_PERIOD,
    OPERATOR_TIMELOCK_PERIOD,
    UNI_FACTORY,
    LOCAL_NETWORKS,
    TEST_NETWORKS,
    MAIN_NETWORKS,
    BSC_NETWORKS,
    ETH_NETWORKS,
};
