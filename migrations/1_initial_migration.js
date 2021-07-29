const Artifactor = require('@truffle/artifactor');
const artifactor = new Artifactor(`${__dirname}/../build/contracts`);

const ExternalArtifacts = {
    //    PositionManager: require('../build/INonfungiblePositionManager.json'),
    //    SwapFactory: require('../build/IUniswapV3FactoryJS.json'),
};

const {LOCAL_NETWORKS, TEST_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.js');

const Migrations = artifacts.require('Migrations');

module.exports = async function (deployer, network) {
    if (!LOCAL_NETWORKS.includes(network) && !TEST_NETWORKS.includes(network) && !MAIN_NETWORKS.includes(network)) {
        throw new Error(`Network:${network} is not a valid network for deployment`);
    }
    for await ([contractName, contractArtifact] of Object.entries(ExternalArtifacts)) {
        await artifactor.save({
            contractName,
            ...contractArtifact,
        });
    }

    await deployer.deploy(Migrations);
};
