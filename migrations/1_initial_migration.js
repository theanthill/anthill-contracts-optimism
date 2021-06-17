const Artifactor = require('@truffle/artifactor');
const artifactor = new Artifactor(`${__dirname}/../build/contracts`);

const ExternalArtifacts = {
    PancakeFactory: require('@pancakeswap2/pancake-swap-core/build/PancakeFactory.json'),
    PancakeRouter: require('@theanthill/pancake-swap-periphery/build/PancakeRouter.json'),
};

const {LOCAL_NETWORKS, TEST_NETWORKS, MAIN_NETWORKS} = require('../deploy.config.ts');

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
};
