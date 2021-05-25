// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    ANTBUSD-LP token pool. LP tokens staked here will generate ANT Token rewards
    to the holder
 */

/**
 *Submitted for verification at Etherscan.io on 2020-07-17
 */

/*
   ____            __   __        __   _
  / __/__ __ ___  / /_ / /  ___  / /_ (_)__ __
 _\ \ / // // _ \/ __// _ \/ -_)/ __// / \ \ /
/___/ \_, //_//_/\__//_//_/\__/ \__//_/ /_\_\
     /___/

* Synthetix: ANTSISANTRewards.sol
*
* Docs: https://docs.synthetix.io/
*
*
* MIT License
* ===========
*
* Copyright (c) 2020 Synthetix
*
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
*/

// File: @openzeppelin/contracts/utils/math/Math.sol

import "@openzeppelin/contracts/utils/math/Math.sol";

// File: @openzeppelin/contracts/utils/math/SafeMath.sol

import "@openzeppelin/contracts/utils/math/SafeMath.sol";

// File: @openzeppelin/contracts/token/ERC20/IERC20.sol

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// File: @openzeppelin/contracts/utils/Address.sol

import "@openzeppelin/contracts/utils/Address.sol";

// File: @openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// File: contracts/IRewardDistributionRecipient.sol

import "../interfaces/IRewardDistributionRecipient.sol";

import "../token/LPTokenWrapperDelegated.sol";

contract BUSDANTLPTokenANTPool is LPTokenWrapperDelegated, IRewardDistributionRecipient {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public antToken;
    uint256 public DURATION = 365 days;

    uint256 public starttime;
    uint256 public periodFinish = 0;
    uint256 public rewardRate = 0;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;

    event RewardAdded(uint256 reward);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);

    constructor(
        address antToken_,
        address lptoken_,
        uint256 starttime_
    ) {
        antToken = IERC20(antToken_);
        lpt = IERC20(lptoken_);
        starttime = starttime_;
    }

    modifier checkStart() {
        require(block.timestamp >= starttime, "BUSDANTLPTokenANTPool: not start");
        _;
    }

    modifier updateReward(address account) {
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return Math.min(block.timestamp, periodFinish);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupply() == 0) {
            return rewardPerTokenStored;
        }
        return rewardPerTokenStored.add(lastTimeRewardApplicable().sub(lastUpdateTime).mul(rewardRate).mul(1e18).div(totalSupply()));
    }

    function earned(address account) public view returns (uint256) {
        return balanceOf(account).mul(rewardPerToken().sub(userRewardPerTokenPaid[account])).div(1e18).add(rewards[account]);
    }

    /**
        Updates rewards for origin account and caller parent for delegated staking

        This method can only be called by the contract owner

        @param amount Amount of LP tokens to stake
        @param origin_account Account that originally owned the LP tokens and on which
                              behalf the tokens are staked
    */
    function stake(uint256 amount, address origin_account) public override updateReward(origin_account) checkStart onlyOwner {
        require(amount > 0, "BUSDANTLPTokenANTPool: Cannot stake 0");
        super.stake(amount, origin_account);
        emit Staked(origin_account, amount);
    }

    /**
        Delegated withdrawing on behalf of an origin account. The caller will receive the
        LP tokens to be withdrawn

        This method can only be called by the contract owner
        
        @param amount Amount of LP tokens to be withdrawn
        @param origin_account Account on which behalf the LP tokens are withdrawn
    */
    function withdraw(uint256 amount, address origin_account) public override updateReward(origin_account) checkStart {
        require(amount > 0, "BUSDANTLPTokenANTPool: Cannot withdraw 0");
        super.withdraw(amount, origin_account);
        emit Withdrawn(origin_account, amount);
    }

    /**
        Delegated exiting on behalf of an origin account. It calls the parent to perform
        a delegated exit and then get the rewards for the origin account

        This method can only be called by the contract owner
        
        @param origin_account Account on which behalf the LP tokens are withdrawn

        @return The amount of LP tokens withdrawn
    */
    function exit(address origin_account) public override onlyOwner returns (uint256) {
        uint256 balance = super.exit(origin_account);
        getReward(origin_account);
        return balance;
    }

    /**
        Gets the rewards for the origin account and sends the reward tokens to it

        This method can only be called by the contract owner
        
        @param origin_account Account on which behalf the LP tokens are withdrawn
    */
    function getReward(address origin_account) public updateReward(origin_account) checkStart onlyOwner {
        uint256 reward = earned(origin_account);
        if (reward > 0) {
            rewards[origin_account] = 0;
            antToken.safeTransfer(origin_account, reward);
            emit RewardPaid(origin_account, reward);
        }
    }

    /**
        Gets the rewards for the caller account and sends the reward tokens to it

        This method can only be called by the contract owner
    */
     function getMyReward() public updateReward(msg.sender) checkStart {
        uint256 reward = earned(msg.sender);
        if (reward > 0) {
            rewards[msg.sender] = 0;
            antToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /**
        Called by the distribution script to allocate an amount of reward tokens
        to the pool, to be rewarded to the pool stake holders when calling getReward()

        @dev Can only be called by the reward distributor set through IRewardDistributionRecipient::setRewardDistribution

        @param reward  Amount of reward tokens allocated to the pool
     */
    function notifyRewardAmount(uint256 reward) external override onlyRewardDistribution updateReward(address(0)) {
        if (block.timestamp > starttime) {
            if (block.timestamp >= periodFinish) {
                rewardRate = reward.div(DURATION);
            } else {
                uint256 remaining = periodFinish.sub(block.timestamp);
                uint256 leftover = remaining.mul(rewardRate);
                rewardRate = reward.add(leftover).div(DURATION);
            }
            lastUpdateTime = block.timestamp;
            periodFinish = block.timestamp.add(DURATION);
            emit RewardAdded(reward);
        } else {
            rewardRate = reward.div(DURATION);
            lastUpdateTime = starttime;
            periodFinish = starttime.add(DURATION);
            emit RewardAdded(reward);
        }
    }
}
