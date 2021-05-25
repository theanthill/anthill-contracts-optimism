// const POOL_START_DATE     = Math.round(Date.now() / 1000) + 1 * 60 * 60;
// const ORACLE_START_DATE   = Math.round(Date.now() / 1000) + 1 * 60 * 120;
// const TREASURY_START_DATE = Math.round(Date.now() / 1000) + 1 * 60 * 120;

const POOL_START_DATE     = 1619777245; // 01/14/2021 @ 4:00am (UTC)
const ORACLE_START_DATE   = 1619777245; // 01/19/2021 @ 4:00am (UTC)
const TREASURY_START_DATE = 1619777245; // 01/21/2021 @ 4:00am (UTC)

// PancakeSwap Factory
const UNI_FACTORY = '0x6725F303b657a9451d8BA641348b6761A6CC7a17';

// Real networks with already deployed Swaps and BUSD
const LOCAL_NETWORKS = ['dev'];
const TEST_NETWORKS = ['testnet', 'local-testnet'];
const MAIN_NETWORKS = ['mainnet', 'local-mainnet'];

module.exports = {
    POOL_START_DATE,
    ORACLE_START_DATE,
    TREASURY_START_DATE,
    UNI_FACTORY,
    LOCAL_NETWORKS,
    TEST_NETWORKS,
    MAIN_NETWORKS
}
