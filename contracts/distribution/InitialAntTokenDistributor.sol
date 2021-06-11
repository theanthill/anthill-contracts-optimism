// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    COntract used to inject the initial reward to the staking pool
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../interfaces/IDistributor.sol";
import "../interfaces/IRewardDistributionRecipient.sol";

contract InitialAntTokenDistributor is IDistributor {
    using SafeMath for uint256;

    event Distributed(address pool, uint256 antTokenAmount);

    bool public once = true;
    uint256 STABLES_ANT_SHARE = 80e18;

    IERC20 public antToken;
    IRewardDistributionRecipient[] public pools;
    uint256 public totalInitialBalance;

    constructor(
        IERC20 _antToken,
        IRewardDistributionRecipient[] memory _pools,
        uint256 _totalInitialBalance
    ) {
        require(_pools.length != 0, "a list of ANT pools are required");

        antToken = _antToken;
        pools = _pools;
        totalInitialBalance = _totalInitialBalance;
    }

    function distribute() public override {
        require(once, "InitialAntTokenDistributor: you cannot run this function twice");

        uint256 amountPerPool = totalInitialBalance.div(pools.length);

        for (uint256 i = 0; i < pools.length; i++) {
            antToken.transfer(address(pools[i]), amountPerPool);
            pools[i].notifyRewardAmount(amountPerPool);

            emit Distributed(address(pools[i]), amountPerPool);
        }

        once = false;
    }
}
