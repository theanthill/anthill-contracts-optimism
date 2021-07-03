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

    IERC20 public token0;
    IERC20 public token1;
    IERC20 public token2;
    uint256 public maxAmount;
    mapping(address => bool) public admins;

    constructor(
        IERC20 _token0,
        IERC20 _token1,
        IERC20 _token2,
        uint256 _maxAmount,
        address[] memory _admins
    ) {
        token0 = _token0;
        token1 = _token1;
        token2 = _token2;
        maxAmount = _maxAmount;

        for (uint256 i = 0; i < _admins.length; ++i) {
            admins[_admins[i]] = true;
        }
    }

    function refill() public {
        uint256 refillAmount = maxAmount;

        if (admins[_msgSender()]) {
            refillAmount *= 20;
        }

        uint256 currentAmount = token0.balanceOf(_msgSender());
        if (currentAmount < refillAmount) {
            token0.safeTransfer(_msgSender(), refillAmount.sub(currentAmount));
        }

        currentAmount = token1.balanceOf(_msgSender());
        if (currentAmount < refillAmount) {
            token1.safeTransfer(_msgSender(), refillAmount.sub(currentAmount));
        }

        currentAmount = token2.balanceOf(_msgSender());
        if (currentAmount < refillAmount) {
            token2.safeTransfer(_msgSender(), refillAmount.sub(currentAmount));
        }
    }
}
