// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
    Helper for providing liquidity to a the ANT-BUSD pool
 */
import "../core/LiquidityStakingHelperV3.sol";

contract BUSDANTLPHelper is LiquidityStakingHelperV3 {
    constructor(
        IERC20 token0,
        IERC20 token1,
        IERC20 lpToken,
        IStakingPoolDelegated lpTokenPool,
        INonfungiblePositionManager positionManager
    ) LiquidityStakingHelperV3(token0, token1, lpToken, lpTokenPool, positionManager) {}
}
