// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    COntract used to inject the initial reward to the staking pool
 */
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
    Interfaces
 */
interface IRewardsDistributor /* [workerant] Use Ownable or AccessControl */{
    function distribute() external;
}

abstract contract IRewardsDistributorRecipient is AccessControl {
    // ======== CONSTANTS =======
    bytes32 public constant REWARDS_ADMIN = keccak256("REWARDS_ADMIN");
    bytes32 public constant REWARDS_DISTRIBUTOR = keccak256("REWARDS_DISTRIBUTOR");

    // ======== STATE =======
    address public _rewardDistributor;

    // ======== CONSTRUCTOR =======
    constructor() {
        _setRoleAdmin(REWARDS_ADMIN, REWARDS_ADMIN);
        _setRoleAdmin(REWARDS_DISTRIBUTOR, REWARDS_ADMIN);

        _rewardDistributor = _msgSender();
        
        _setupRole(REWARDS_ADMIN, _msgSender());
        _setupRole(REWARDS_DISTRIBUTOR, _msgSender());
    }

    // ======== MODIFIERS =======
    modifier onlyRewardsAdmin() {
        require(hasRole(REWARDS_ADMIN, _msgSender()), "IRewardsDistributorRecipient: sender requires permission");
        _;
    }

    modifier onlyRewardsDistributor() {
        require(hasRole(REWARDS_DISTRIBUTOR, _msgSender()), "IRewardsDistributorRecipient: Caller is not a reward distributor");
        _;
    }

    // ======== ADMIN =======
    function transferRewardsDistributor(address newRewardDistributor) external virtual onlyRewardsAdmin {
        revokeRole(REWARDS_DISTRIBUTOR, _rewardDistributor);
        _rewardDistributor = newRewardDistributor;
        grantRole(REWARDS_DISTRIBUTOR, newRewardDistributor);
    }

    // ======== INTERFACE =======
    function notifyRewardAmount(uint256 reward) external virtual;
}

/**
    Helper contract to distribute rewards funds to different contracts in one single transaction
 */
contract RewardsDistributor is IRewardsDistributor {
    using SafeMath for uint256;

    // ====== STATE ======
    IERC20 public _rewardToken;
    IRewardsDistributorRecipient[] public _rewardRecipients;

    // ====== CONSTRUCTOR ======
    constructor(
        IERC20 rewardToken,
        IRewardsDistributorRecipient[] memory rewardRecipients
    ) {
        require(rewardRecipients.length != 0, "RewardsDistributor: recipients list is empty");

        _rewardToken = rewardToken;
        _rewardRecipients = rewardRecipients;
    }

    function getTotalRewards() external view returns(uint256) {
        return _rewardToken.balanceOf(address(this));
    }

    // ====== MUTABLES ======
    function distribute() public override {
        uint256 totalRewards = _rewardToken.balanceOf(address(this));
        uint256 amountPerRecipient = totalRewards.div(_rewardRecipients.length);

        for (uint256 i = 0; i < _rewardRecipients.length; i++) {
            _rewardToken.transfer(address(_rewardRecipients[i]), amountPerRecipient);
            _rewardRecipients[i].notifyRewardAmount(amountPerRecipient);

            emit RewardDistributed(address(_rewardRecipients[i]), amountPerRecipient);
        }
    }

    // ====== EVENTS ======
    event RewardDistributed(address recipient, uint256 amount);
}
