// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "../owner/Operator.sol";

/**
    Contract to provide with token funds to the caller
 */
contract TokenFaucet is Operator {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 token0;
    IERC20 token1;
    uint256 maxAmount;

    constructor(IERC20 _token0, IERC20 _token1, uint256 _maxAmount)
    {
        token0 = _token0;
        token1 = _token1;
        maxAmount = _maxAmount;
    }

    function refill() public
    {
        uint256 currentAmount = token0.balanceOf(msg.sender);
        if (currentAmount<maxAmount) {
            token0.safeTransfer(msg.sender, maxAmount.sub(currentAmount));
        }

        currentAmount = token1.balanceOf(msg.sender);
        if (currentAmount<maxAmount) {
            token1.safeTransfer(msg.sender, maxAmount.sub(currentAmount));
        }
    }
}
