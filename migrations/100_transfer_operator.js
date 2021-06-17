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

    const admins = [accounts[0]];
    const timelock = await deployer.deploy(Timelock, 2 * DAY, admins);

    console.log(`Assigning Treasury as Owner and Operator of the protocol tokens`);
    for await (const contract of [antToken, antShare, antBond]) {
        await contract.transferOperator(treasury.address);
        await contract.transferOwnership(treasury.address);
    }
    
    console.log(`Assigning (${accounts[0]}) as Operator for Boardroom (${Boardroom.address})`);
    await boardroom.transferOperator(treasury.address);
    console.log(`Transferring Ownership of Boardroom (${Boardroom.address}) to Timelock (${Timelock.address})`);
    await boardroom.transferOwnership(timelock.address);
    
    console.log(`Assigning (${accounts[0]}) as Operator for Treasury (${Treasury.address})`);
    await treasury.transferOperator(timelock.address);
    console.log(`Transferring Ownership of Treasury (${Treasury.address}) to Timelock (${Timelock.address})`);
    await treasury.transferOwnership(timelock.address);
};
