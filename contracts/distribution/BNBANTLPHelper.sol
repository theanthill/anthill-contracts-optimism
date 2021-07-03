// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Helper for providing liquidity to a the ANT-BNB pool
 */
import "../core/LiquidityStakingHelper.sol";

contract BNBANTLPHelper is LiquidityStakingHelper {
    constructor(
        IERC20 token0,
        IERC20 token1,
        IERC20 lpToken,
        IStakingPoolDelegated lpTokenPool,
        IPancakeRouter02 pancakeRouter
    ) LiquidityStakingHelper(token0, token1, lpToken, lpTokenPool, pancakeRouter) {}
}
