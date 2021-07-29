// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

/**
    Helps providing liquidity to PancakeSwap and staking the LP tokens into a staking pool all
    in one operation
 */

import "@theanthill/openzeppelin-optimism/contracts/utils/Context.sol";
import "@theanthill/openzeppelin-optimism/contracts/math/Math.sol";
import "@theanthill/openzeppelin-optimism/contracts/math/SafeMath.sol";
import "@theanthill/openzeppelin-optimism/contracts/token/ERC20/IERC20.sol";
import "@theanthill/openzeppelin-optimism/contracts/token/ERC20/SafeERC20.sol";

import "@uniswap/v3-periphery-optimism/contracts/interfaces/INonfungiblePositionManager.sol";

import "./StakingPoolDelegated.sol";

contract LiquidityStakingHelperV3 is Context {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    uint24 constant FEE = 300;
    int24 constant TICK_LOWER = 300;
    int24 constant TICK_UPPER = 300;

    IERC20 _token0;
    IERC20 _token1;
    IERC20 _lptoken;
    IStakingPoolDelegated _lpTokenPool;
    INonfungiblePositionManager _positionManager;

    mapping(address => uint256) _positions;

    /* ========== CONSTRUCTOR ========== */
    constructor(
        IERC20 token0,
        IERC20 token1,
        IERC20 lptoken,
        IStakingPoolDelegated lpTokenPool,
        INonfungiblePositionManager positionManager
    ) {
        _token0 = token0;
        _token1 = token1;
        _lptoken = lptoken;
        _lpTokenPool = lpTokenPool;
        _positionManager = positionManager;

        _token0.approve(address(_positionManager), type(uint256).max);
        _token1.approve(address(_positionManager), type(uint256).max);
        _lptoken.approve(address(_lpTokenPool), type(uint256).max);
        _lptoken.approve(address(_positionManager), type(uint256).max);
    }

    /* ========== MUTABLES ========== */
    function stake(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) public {
        _token0.safeTransferFrom(_msgSender(), address(this), amount0Desired);
        _token1.safeTransferFrom(_msgSender(), address(this), amount1Desired);

        uint256 tokenId = _positions[_msgSender()];

        uint256 liquidity;
        uint256 amount0;
        uint256 amount1;

        if (tokenId == 0) {
            (tokenId, liquidity, amount0, amount1) = _positionManager.mint(
                INonfungiblePositionManager.MintParams({
                    token0: address(_token0),
                    token1: address(_token1),
                    fee: FEE,
                    tickLower: TICK_LOWER,
                    tickUpper: TICK_UPPER,
                    amount0Desired: amount0Desired,
                    amount1Desired: amount1Desired,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    recipient: address(this),
                    deadline: deadline
                })
            );
            _positions[_msgSender()] = tokenId;
        } else {
            (liquidity, amount0, amount1) = _positionManager.increaseLiquidity(
                INonfungiblePositionManager.IncreaseLiquidityParams({
                    tokenId: tokenId,
                    amount0Desired: amount0Desired,
                    amount1Desired: amount1Desired,
                    amount0Min: amount0Min,
                    amount1Min: amount1Min,
                    deadline: deadline
                })
            );
        }

        require(liquidity > 0, "Received 0 liquidity from positions manager");

        // Returned unused tokens
        if (amount0 != amount0Desired) {
            _token0.safeTransfer(_msgSender(), amount0Desired - amount0);
        }
        if (amount1 != amount1Desired) {
            _token1.safeTransfer(_msgSender(), amount1Desired - amount1);
        }

        _lpTokenPool.stake(liquidity, _msgSender());
    }

    function withdraw(
        uint128 liquidity,
        uint256 amount0Min,
        uint256 amount1Min,
        uint256 deadline
    ) public {
        uint256 tokenId = _positions[_msgSender()];
        require(tokenId != 0, "There is no liquidity for member");

        _lpTokenPool.withdraw(liquidity, _msgSender());

        _positionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: liquidity,
                amount0Min: amount0Min,
                amount1Min: amount1Min,
                deadline: deadline
            })
        );
    }

    function exit(uint256 deadline) external {
        uint256 tokenId = _positions[_msgSender()];
        require(tokenId != 0, "There is no liquidity for member");

        uint256 liquidity = _lpTokenPool.exit(_msgSender());
        _positionManager.decreaseLiquidity(
            INonfungiblePositionManager.DecreaseLiquidityParams({
                tokenId: tokenId,
                liquidity: uint128(liquidity),
                amount0Min: 0,
                amount1Min: 0,
                deadline: deadline
            })
        );
    }
}
