// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";

/**
    Contract to provide with token funds to the caller
 */
contract TokenFaucet is Context {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 token0;
    IERC20 token1;
    IERC20 token2;
    uint256 maxAmount;

    constructor(IERC20 _token0, IERC20 _token1, IERC20 _token2, uint256 _maxAmount)
    {
        token0 = _token0;
        token1 = _token1;
        token2 = _token2;
        maxAmount = _maxAmount;
    }

    function refill() public
    {
        uint256 currentAmount = token0.balanceOf(_msgSender());
        if (currentAmount<maxAmount) {
            token0.safeTransfer(_msgSender(), maxAmount.sub(currentAmount));
        }

        currentAmount = token1.balanceOf(_msgSender());
        if (currentAmount<maxAmount) {
            token1.safeTransfer(_msgSender(), maxAmount.sub(currentAmount));
        }

        currentAmount = token2.balanceOf(_msgSender());
        if (currentAmount<maxAmount) {
            token2.safeTransfer(_msgSender(), maxAmount.sub(currentAmount));
        }
    }
}
