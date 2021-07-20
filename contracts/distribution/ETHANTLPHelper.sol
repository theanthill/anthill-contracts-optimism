// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
    Helper for providing liquidity to a the ANT-ETH pool
 */
import "../core/LiquidityStakingHelper.sol";

contract ETHANTLPHelper is LiquidityStakingHelper {
    constructor(
        IERC20 token0,
        IERC20 token1,
        IERC20 lpToken,
        IStakingPoolDelegated lpTokenPool,
        IPancakeRouter02 pancakeRouter
    ) LiquidityStakingHelper(token0, token1, lpToken, lpTokenPool, pancakeRouter) {}
}
