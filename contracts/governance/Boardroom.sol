// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Boardroom for staking of the _tokenShares and earning rewards during inflationary periods
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "../access/OperatorAccessControl.sol";
import "../utils/ContractGuard.sol";
import "../core/StakingPool.sol";

/**
    Interface
 */
interface IBoardroom {
    function allocateSeigniorage(uint256 amount) external;
}

/**
    Baordroom contract where the share holders can stake their _token Shares in exchange of
    rewards in _token Tokens
 */
contract Boardroom is StakingPool, OperatorAccessControl, ContractGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    /* ========== DATA STRUCTURES ========== */

    struct Boardseat {
        uint256 lastSnapshotIndex;
        uint256 rewardEarned;
    }

    struct BoardSnapshot {
        uint256 time;
        uint256 rewardReceived;
        uint256 rewardPerShare;
    }

    /* ========== STATE VARIABLES ========== */

    IERC20 private _token;

    mapping(address => Boardseat) private directors;
    BoardSnapshot[] private boardHistory;

    /* ========== CONSTRUCTOR ========== */

    constructor(IERC20 token, IERC20 stakingToken) StakingPool(stakingToken) {
        _token = token;

        BoardSnapshot memory genesisSnapshot = BoardSnapshot({
            time: block.number,
            rewardReceived: 0,
            rewardPerShare: 0
        });
        boardHistory.push(genesisSnapshot);
    }

    /* ========== Modifiers =============== */
    modifier directorExists {
        require(balanceOf(_msgSender()) > 0, "Boardroom: The director does not exist");
        _;
    }

    modifier updateReward(address director) {
        if (director != address(0)) {
            Boardseat memory seat = directors[director];
            seat.rewardEarned = earned(director);
            seat.lastSnapshotIndex = latestSnapshotIndex();
            directors[director] = seat;
        }
        _;
    }

    /* ========== VIEW FUNCTIONS ========== */

    // =========== Snapshot getters

    function latestSnapshotIndex() public view returns (uint256) {
        return boardHistory.length.sub(1);
    }

    function getLatestSnapshot() internal view returns (BoardSnapshot memory) {
        return boardHistory[latestSnapshotIndex()];
    }

    function getLastSnapshotIndexOf(address director) public view returns (uint256) {
        return directors[director].lastSnapshotIndex;
    }

    function getLastSnapshotOf(address director) internal view returns (BoardSnapshot memory) {
        return boardHistory[getLastSnapshotIndexOf(director)];
    }

    // =========== Director getters

    function rewardPerShare() public view returns (uint256) {
        return getLatestSnapshot().rewardPerShare;
    }

    function earned(address director) public view returns (uint256) {
        uint256 latestRPS = getLatestSnapshot().rewardPerShare;
        uint256 storedRPS = getLastSnapshotOf(director).rewardPerShare;

        return balanceOf(director).mul(latestRPS.sub(storedRPS)).div(1e18).add(directors[director].rewardEarned);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */
    function stake(uint256 amount) public override onlyOneBlock updateReward(_msgSender()) {
        require(amount > 0, "Boardroom: Cannot stake 0");
        super.stake(amount);
        emit Staked(_msgSender(), amount);
    }

    function withdraw(uint256 amount) public override onlyOneBlock directorExists updateReward(_msgSender()) {
        require(amount > 0, "Boardroom: Cannot withdraw 0");
        super.withdraw(amount);
        emit Withdrawn(_msgSender(), amount);
    }

    function exit() public override onlyOneBlock directorExists updateReward(_msgSender()) returns (uint256) {
        uint256 lpTokensAmount = super.exit();
        claimReward();
        return lpTokensAmount;
    }

    function claimReward() public updateReward(_msgSender()) {
        uint256 reward = directors[_msgSender()].rewardEarned;
        if (reward > 0) {
            directors[_msgSender()].rewardEarned = 0;
            _token.safeTransfer(_msgSender(), reward);
            emit RewardPaid(_msgSender(), reward);
        }
    }

    function allocateSeigniorage(uint256 amount) external onlyOneBlock onlyOperator {
        require(amount > 0, "Boardroom: Cannot allocate 0");
        require(totalSupply() > 0, "Boardroom: Cannot allocate when totalSupply is 0");

        // Create & add new snapshot
        uint256 prevRPS = getLatestSnapshot().rewardPerShare;
        uint256 nextRPS = prevRPS.add(amount.mul(1e18).div(totalSupply()));

        BoardSnapshot memory newSnapshot = BoardSnapshot({
            time: block.number,
            rewardReceived: amount,
            rewardPerShare: nextRPS
        });
        boardHistory.push(newSnapshot);

        _token.safeTransferFrom(_msgSender(), address(this), amount);

        emit RewardAdded(_msgSender(), amount);
    }

    /* ========== EVENTS ========== */

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(address indexed user, uint256 reward);
}
