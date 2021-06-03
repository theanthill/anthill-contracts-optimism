// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Helper for providing liquidity to a pair pool
 */

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "@theanthill/pancake-swap-periphery/contracts/interfaces/IPancakeRouter02.sol";

import "../token/LPTokenWrapperDelegated.sol";

contract BNBANTLPHelper {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping (address => uint256) private _balances;

    IERC20 _token0;
    IERC20 _token1;
    IERC20 _lptoken;
    LPTokenWrapperDelegated _lpTokenPool;
    IPancakeRouter02 _pancakeRouter;

    constructor(
        IERC20 token0,
        IERC20 token1,
        IERC20 lptoken,
        LPTokenWrapperDelegated lpTokenPool,
        IPancakeRouter02 pancakeRouter
    ) {
        _token0 = token0;
        _token1 = token1;
        _lptoken = lptoken;
        _lpTokenPool = lpTokenPool;
        _pancakeRouter = pancakeRouter;

        _token0.approve(address(_pancakeRouter), type(uint256).max);
        _token1.approve(address(_pancakeRouter), type(uint256).max);
        _lptoken.approve(address(_lpTokenPool), type(uint256).max);
        _lptoken.approve(address(_pancakeRouter), type(uint256).max);
    }

    function stake(uint amount0Desired, uint amount1Desired, uint amount0Min, uint amount1Min, uint deadline) public {
        _token0.safeTransferFrom(msg.sender, address(this), amount0Desired);
        _token1.safeTransferFrom(msg.sender, address(this), amount1Desired);

        (uint amount0, uint amount1, uint liquidity) = _pancakeRouter.addLiquidity(address(_token0), address(_token1), amount0Desired, amount1Desired, amount0Min, amount1Min, address(this), deadline);
        require(liquidity > 0, "Received 0 liquidity from Router");
        
        // Returned unused tokens
        if (amount0 != amount0Desired) {
            _token0.safeTransfer(msg.sender, amount0Desired - amount0);
        }
        if (amount1 != amount1Desired) {
            _token1.safeTransfer(msg.sender, amount1Desired - amount1);
        }

        _lpTokenPool.stake(liquidity, msg.sender);
    }

    function withdraw(uint liquidity, uint amount0Min, uint amount1Min, uint deadline) public {
        _lpTokenPool.withdraw(liquidity, msg.sender);
        _pancakeRouter.removeLiquidity(address(_token0), address(_token1), liquidity, amount0Min, amount1Min, msg.sender, deadline);
    }

    function exit(uint deadline) external {
        uint256 liquidity = _lpTokenPool.exit(msg.sender);
        _pancakeRouter.removeLiquidity(address(_token0), address(_token1), liquidity, 0, 0, msg.sender, deadline);
    }
}
