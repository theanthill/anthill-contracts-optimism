/**
 * Transfer operator and ownership of the deployed contracts
 */
const Boardroom = artifacts.require('Boardroom');
const Treasury = artifacts.require('Treasury');
const AntToken = artifacts.require('AntToken');
const AntBond = artifacts.require('AntBond');
const AntShare = artifacts.require('AntShare');
const Timelock = artifacts.require('Timelock');

const DAY = 86400;

module.exports = async (deployer, network, accounts) => {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();
    const antBond = await AntBond.deployed();
    const treasury = await Treasury.deployed();
    const boardroom = await Boardroom.deployed();
    const timelock = await deployer.deploy(Timelock, accounts[0], 2 * DAY);

    for await (const contract of [antToken, antShare, antBond]) {
        await contract.transferOperator(treasury.address);
        await contract.transferOwnership(treasury.address);
    }
    await boardroom.transferOperator(treasury.address);
    await boardroom.transferOwnership(timelock.address);
    await treasury.transferOperator(timelock.address);
    await treasury.transferOwnership(timelock.address);

    console.log(`Transferred the operator role from the deployer (${accounts[0]}) to Treasury (${Treasury.address})`);
};
