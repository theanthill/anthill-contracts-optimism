/**
 * Generates a json file with all the deployments to connect the contracts to the frontend
 */
const fs = require('fs');
const path = require('path');
const util = require('util');

const {INITIAL_BSC_DEPLOYMENT_POOLS, INITIAL_ETH_DEPLOYMENT_POOLS} = require('./migration-config');
const {BSC_NETWORKS} = require('../deploy.config');
const {getBandOracle} = require('./external-contracts');

const writeFile = util.promisify(fs.writeFile);

function distributionPoolContracts(network) {
    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    let contracts = [];
    for (let pool of initialDeploymentPools) {
        contracts.push(pool.contractName);
        contracts.push(pool.helperContract);
    }

    return contracts;
}

function externalPairs(network) {
    const initialDeploymentPools = BSC_NETWORKS.includes(network)
        ? INITIAL_BSC_DEPLOYMENT_POOLS
        : INITIAL_ETH_DEPLOYMENT_POOLS;

    let pairs = [];
    for (let pool of initialDeploymentPools) {
        pairs.push(pool.mainToken + '-' + pool.otherToken);
    }

    return pairs;
}

// Deployment and ABI will be generated for contracts listed on here.
// The deployment thus can be used on anttoken-frontend.
const exportedContracts = ['Oracle', 'AntToken', 'AntBond', 'AntShare', 'Boardroom', 'Treasury', 'TokenFaucet'];

const externalTokens = ['BUSD', 'BNB', 'ETH', 'PancakeRouter'];

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    exportedContracts.push(...distributionPoolContracts(network));
    externalTokens.push(...externalPairs(network));

    // Deployments
    const deployments = {};

    const exportedArtifacts = exportedContracts.map((name) => artifacts.require(name));

    for (const artifact of exportedArtifacts) {
        console.log(`Exporting artifact: ${artifact.contractName} at address ${artifact.address}`);
        deployments[artifact.contractName] = {
            address: artifact.address,
            abi: artifact.abi,
        };
    }

    const bandOracle = await getBandOracle(network);
    console.log(`Exporting artifact: BandOracle at address ${bandOracle.address}`);
    deployments['BandOracle'] = {
        address: bandOracle.address,
        abi: bandOracle.abi,
    };

    const deploymentPath = path.resolve(__dirname, `../deployments/deployments.${network}.json`);
    await writeFile(deploymentPath, JSON.stringify(deployments, null, 2));

    // External tokens
    const externals = {};

    for (const name of externalTokens) {
        const token = require('../build/contracts/' + name + '.json');
        console.log(`Exporting artifact: ${name} at address ${token.address}`);
        externals[name] = {
            address: token.address,
            decimals: token.decimals,
        };
    }

    const externalTokensPath = path.resolve(__dirname, `../deployments/externals.${network}.json`);
    await writeFile(externalTokensPath, JSON.stringify(externals, null, 2));

    console.log(`Exported all deployments to ../deployments/deployments.${network}.json`);
    console.log(`Exported all externals to ../deployments/externals.${network}.json`);
};
