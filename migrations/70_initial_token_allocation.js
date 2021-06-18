/**
 * Initial allocation of Ant Token and Ant Shares
 */
const BigNumber = require('bignumber.js');

const {MAIN_NETWORKS} = require('../deploy.config.ts');
const {TREASURY_ACCOUNT,
    TREASURY_ANT_ALLOCATION, 
    MAX_ANTS_SUPPLY,
    TEST_TREASURY_ACCOUNT,
    TEST_HQ_ACCOUNT,
    TEST_HQ_ANT_ALLOCATION,
    TEST_HQ_ANTS_ALLOCATION
} = require('./migration-config');

// ============ Contracts ============
const AntToken = artifacts.require('AntToken');
const AntShare = artifacts.require('AntShare');

// ============ Main Migration ============
async function migration(deployer, network, accounts) {
    const antToken = await AntToken.deployed();
    const antShare = await AntShare.deployed();

    const unit = BigNumber(10 ** 18);

    // Mainnet
    if (network.includes(MAIN_NETWORKS))
    {   
        console.log(`[Using Mainnet configuration]`)
        const treasuryANTAllocation = unit.times(TREASURY_ANT_ALLOCATION);
        const treasuryANTSAllocation = unit.times(MAX_ANTS_SUPPLY);
        
        console.log('Minting ' + TREASURY_ANT_ALLOCATION + ' Ant Tokens to Treasury Account');
        await antToken.mint(TREASURY_ACCOUNT, treasuryANTAllocation);

        console.log('Minting ' + MAX_ANTS_SUPPLY + ' Ant Shares to Treasury Account');
        await antShare.mint(TREASURY_ACCOUNT, treasuryANTSAllocation);
    }
    else // Testnet
    {
        console.log(`[Using Testnet configuration]`)
        const ANTAllocation = TREASURY_ANT_ALLOCATION - TEST_HQ_ANT_ALLOCATION;
        const ANTSAllocation = MAX_ANTS_SUPPLY - TEST_HQ_ANTS_ALLOCATION;

        const treasuryANTAllocation = unit.times(ANTAllocation);
        const treasuryANTSAllocation = unit.times(ANTSAllocation);
        
        console.log('Minting ' + ANTAllocation + ' Ant Tokens to Treasury Account');
        await antToken.mint(TEST_TREASURY_ACCOUNT, treasuryANTAllocation);

        console.log('Minting ' + ANTSAllocation + ' Ant Shares to Treasury Account');
        await antShare.mint(TEST_TREASURY_ACCOUNT, treasuryANTSAllocation);

        const HQANTSAllocation = unit.times(TEST_HQ_ANTS_ALLOCATION);

        // There is no allocation of Ant Token for the test HQ account as it will be
        // directly used to provide liquidity
        console.log('Minting ' + TEST_HQ_ANTS_ALLOCATION + ' Ant Shares to test HQ Account');
        await antShare.mint(TEST_HQ_ACCOUNT, HQANTSAllocation);
    }
}

module.exports = migration;
