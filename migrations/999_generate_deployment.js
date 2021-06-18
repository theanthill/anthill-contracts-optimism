/**
 * Generates a json file with all the deployments to connect the contracts to the frontend
 */
const fs = require('fs');
const path = require('path');
const util = require('util');

const writeFile = util.promisify(fs.writeFile);

function distributionPoolContracts() {
    return fs
        .readdirSync(path.resolve(__dirname, '../contracts/distribution'))
        .map((filename) => filename.replace('.sol', ''));
}

// Deployment and ABI will be generated for contracts listed on here.
// The deployment thus can be used on anttoken-frontend.
const exportedContracts = [
    'Oracle',
    'AntToken',
    'AntBond',
    'AntShare',
    'Boardroom',
    'Treasury',
    ...distributionPoolContracts(),
    'TokenFaucet',
    'MockStdReference'
];

const externalTokens = ['ANT-BUSD', 'BUSD', 'ANT-BNB', 'BNB', 'PancakeRouter'];

// ============ Main Migration ============
module.exports = async (deployer, network, accounts) => {
    // Deployments
    const deployments = {};

    for (const name of exportedContracts) {
        const contract = artifacts.require(name);
        deployments[name] = {
            address: contract.address,
            abi: contract.abi,
        };
    }

    const deploymentPath = path.resolve(__dirname, `../deployments/deployments.${network}.json`);
    await writeFile(deploymentPath, JSON.stringify(deployments, null, 2));

    // External tokens
    const externals = {};

    for (const name of externalTokens) {
        const token = require('../build/contracts/' + name + '.json');
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
