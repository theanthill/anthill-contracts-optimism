/**
 * Export external contracts addresses
 */
const {
    getPancakeFactory,
    getPancakeRouter,
    getTokenContract,
    getBUSD,
    getBNB,
    getETH,
} = require('./external-contracts');
const {exportContract, exportToken} = require('./export-contracts');

const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    const BUSD = await getBUSD(network);
    const BNB = await getBNB(network);
    const ETH = await getETH(network);
    const pancakeRouter = await getPancakeRouter(network);
    const pancakeFactory = await getPancakeFactory(network);

    exportToken('BUSD', BUSD.address, 18);
    exportToken('BNB', BNB.address, 18);
    exportToken('ETH', ETH.address, 18);
    exportContract('PancakeRouter', pancakeRouter.address);

    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    for (let pool of initialDeploymentPools) {
        const mainToken = await getTokenContract(pool.mainToken, network);
        const otherToken = await getTokenContract(pool.otherToken, network);

        const pairAddress = await pancakeFactory.getPair(mainToken.address, otherToken.address);
        console.log(`${pool.mainToken}-${pool.otherToken} at ${pairAddress}`);
        exportToken(pool.mainToken + '-' + pool.otherToken, pairAddress, 18);
    }
};
