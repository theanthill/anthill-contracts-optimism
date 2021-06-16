// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "./owner/Operator.sol";
import "./utils/ContractGuard.sol";

contract AntShareWrapper is Context {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public antShare;

    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function stake(uint256 amount) public virtual {
        _totalSupply = _totalSupply.add(amount);
        _balances[_msgSender()] = _balances[_msgSender()].add(amount);
        antShare.safeTransferFrom(_msgSender(), address(this), amount);
    }

    function withdraw(uint256 amount) public virtual {
        uint256 directorAntShare = _balances[_msgSender()];
        require(directorAntShare >= amount, "Boardroom: withdraw request greater than staked amount");
        _totalSupply = _totalSupply.sub(amount);
        _balances[_msgSender()] = directorAntShare.sub(amount);
        antShare.safeTransfer(_msgSender(), amount);
    }
}

contract Boardroom is AntShareWrapper, ContractGuard, Operator {
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
        uint256 rewardPerAntShare;
    }

    /* ========== STATE VARIABLES ========== */

    IERC20 private ant;

    mapping(address => Boardseat) private directors;
    BoardSnapshot[] private boardHistory;

    /* ========== CONSTRUCTOR ========== */

    constructor(IERC20 _ant, IERC20 _antShare) {
        ant = _ant;
        antShare = _antShare;

        BoardSnapshot memory genesisSnapshot = BoardSnapshot({time: block.number, rewardReceived: 0, rewardPerAntShare: 0});
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

    function rewardPerAntShare() public view returns (uint256) {
        return getLatestSnapshot().rewardPerAntShare;
    }

    function earned(address director) public view returns (uint256) {
        uint256 latestRPS = getLatestSnapshot().rewardPerAntShare;
        uint256 storedRPS = getLastSnapshotOf(director).rewardPerAntShare;

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

    function exit() external {
        withdraw(balanceOf(_msgSender()));
        claimReward();
    }

    function claimReward() public updateReward(_msgSender()) {
        uint256 reward = directors[_msgSender()].rewardEarned;
        if (reward > 0) {
            directors[_msgSender()].rewardEarned = 0;
            ant.safeTransfer(_msgSender(), reward);
            emit RewardPaid(_msgSender(), reward);
        }
    }

    function allocateSeigniorage(uint256 amount) external onlyOneBlock onlyOperator {
        require(amount > 0, "Boardroom: Cannot allocate 0");
        require(totalSupply() > 0, "Boardroom: Cannot allocate when totalSupply is 0");

        // Create & add new snapshot
        uint256 prevRPS = getLatestSnapshot().rewardPerAntShare;
        uint256 nextRPS = prevRPS.add(amount.mul(1e18).div(totalSupply()));

        BoardSnapshot memory newSnapshot = BoardSnapshot({time: block.number, rewardReceived: amount, rewardPerAntShare: nextRPS});
        boardHistory.push(newSnapshot);

        ant.safeTransferFrom(_msgSender(), address(this), amount);

        emit RewardAdded(_msgSender(), amount);
    }

    /* ========== EVENTS ========== */

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event RewardAdded(address indexed user, uint256 reward);
}
