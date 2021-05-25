// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "./interfaces/IOracle.sol";
import "./interfaces/IBoardroom.sol";
import "./interfaces/IAntAsset.sol";
import "./interfaces/ISimpleERCFund.sol";
import "./owner/Operator.sol";
import "./utils/Epoch.sol";
import "./utils/ContractGuard.sol";

/**
 * @title Ant Token Treasury contract
 * @notice Monetary policy logic to adjust supplies of ant token assets
 * @author Summer Smith & Rick Sanchez
 */
contract Treasury is ContractGuard, Epoch {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;
    
    /* ========== STATE VARIABLES ========== */

    // ========== FLAGS
    bool public migrated = false;
    bool public initialized = false;

    // ========== CORE
    address public fund;
    address public antToken;
    address public antBond;
    address public antShare;
    address public boardroom;

    IOracle public antTokenOracle;

    // ========== PARAMS
    uint256 private accumulatedSeigniorage = 0;
    uint256 public fundAllocationRate = 2; // %

    /* ========== CONSTRUCTOR ========== */

    constructor(
        address _antToken,
        address _antBond,
        address _antShare,
        IOracle _antTokenOracle,
        address _boardroom,
        address _fund,
        uint256 _startTime
    )
        // [workerant] REVIEW
        //Epoch(8 hours, _startTime, 0)
        Epoch(10 minutes, _startTime, 0)
    {
        antToken = _antToken;
        antBond = _antBond;
        antShare = _antShare;
        antTokenOracle = _antTokenOracle;

        boardroom = _boardroom;
        fund = _fund;
    }

    /* =================== Modifier =================== */

    modifier checkMigration {
        require(!migrated, "Treasury: migrated");

        _;
    }

    modifier checkOperator {
        require(
            IAntAsset(antToken).operator() == address(this) &&
                IAntAsset(antBond).operator() == address(this) &&
                IAntAsset(antShare).operator() == address(this) &&
                Operator(boardroom).operator() == address(this),
            "Treasury: need more permission"
        );

        _;
    }

    /* ========== VIEW FUNCTIONS ========== */

    // budget
    function getReserve() public view returns (uint256) {
        return accumulatedSeigniorage;
    }

    function getAntTokenPrice() public view returns (uint256) {
        try antTokenOracle.price1Last() returns (uint256 price) {
            return price;
        } catch {
            revert("Treasury: failed to consult antToken price from the oracle");
        }
    }

    function antTokenPriceCeiling() public view returns (uint256) {
        return antTokenOracle.antTokenPriceOne().mul(uint256(105)).div(100);
    }

    /* ========== GOVERNANCE ========== */

    function initialize() public checkOperator {
        require(!initialized, "Treasury: initialized");

        // burn all of it's balance
        IAntAsset(antToken).burn(IERC20(antToken).balanceOf(address(this)));

        // set accumulatedSeigniorage to it's balance
        accumulatedSeigniorage = IERC20(antToken).balanceOf(address(this));

        initialized = true;
        emit Initialized(msg.sender, block.number);
    }

    function migrate(address target) public onlyOperator checkOperator {
        require(!migrated, "Treasury: migrated");

        // Ant Token
        Operator(antToken).transferOperator(target);
        Operator(antToken).transferOwnership(target);
        IERC20(antToken).transfer(target, IERC20(antToken).balanceOf(address(this)));

        // Ant Bond
        Operator(antBond).transferOperator(target);
        Operator(antBond).transferOwnership(target);
        IERC20(antBond).transfer(target, IERC20(antBond).balanceOf(address(this)));

        // share
        Operator(antShare).transferOperator(target);
        Operator(antShare).transferOwnership(target);
        IERC20(antShare).transfer(target, IERC20(antShare).balanceOf(address(this)));

        migrated = true;
        emit Migration(target);
    }

    function setFund(address newFund) public onlyOperator {
        fund = newFund;
        emit ContributionPoolChanged(msg.sender, newFund);
    }

    function setFundAllocationRate(uint256 rate) public onlyOperator {
        fundAllocationRate = rate;
        emit ContributionPoolRateChanged(msg.sender, rate);
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    function _updateAntTokenPrice() internal {
        try antTokenOracle.update() {} catch {}
    }

    function buyAntBonds(uint256 amount, uint256 targetPrice) external onlyOneBlock checkMigration checkStartTime checkOperator {
        require(amount > 0, "Treasury: cannot purchase antBonds with zero amount");

        uint256 antTokenPrice = getAntTokenPrice();

        require(antTokenPrice == targetPrice, "Treasury: antToken price moved");
        require(antTokenPrice < antTokenOracle.antTokenPriceOne(), "Treasury: antTokenPrice not eligible for antBond purchase");

        uint256 priceRatio = antTokenPrice.mul(1e18).div(antTokenOracle.antTokenPriceOne());
        IAntAsset(antToken).burnFrom(msg.sender, amount);
        IAntAsset(antBond).mint(msg.sender, amount.mul(1e18).div(priceRatio));
        _updateAntTokenPrice();

        emit BoughtAntBonds(msg.sender, amount);
    }

    function redeemAntBonds(
        uint256 amount /* [workerant]: REVIEW, uint256 targetPrice*/
    ) external onlyOneBlock checkMigration checkStartTime checkOperator {
        require(amount > 0, "Treasury: cannot redeem antBonds with zero amount");

        uint256 antTokenPrice = getAntTokenPrice();
        // [workerant] REVIEW
        //require(antTokenPrice == targetPrice, "Treasury: antToken price moved");
        require(
            antTokenPrice > antTokenPriceCeiling(), // price > realAntTokenPrice * 1.05
            "Treasury: antTokenPrice not eligible for antBond purchase"
        );
        require(IERC20(antToken).balanceOf(address(this)) >= amount, "Treasury: treasury has no more budget");

        accumulatedSeigniorage = accumulatedSeigniorage.sub(Math.min(accumulatedSeigniorage, amount));

        IAntAsset(antBond).burnFrom(msg.sender, amount);
        IERC20(antToken).safeTransfer(msg.sender, amount);
        _updateAntTokenPrice();

        emit RedeemedAntBonds(msg.sender, amount);
    }

    function allocateSeigniorage() external onlyOneBlock checkMigration checkStartTime checkEpoch checkOperator {
        _updateAntTokenPrice();
        uint256 antTokenPrice = getAntTokenPrice();
        if (antTokenPrice <= antTokenPriceCeiling()) {
            return; // just advance epoch instead revert
        }

        // circulating supply
        uint256 antTokenSupply = IERC20(antToken).totalSupply().sub(accumulatedSeigniorage);
        uint256 percentage = (antTokenPrice.mul(1e18).div(antTokenOracle.antTokenPriceOne())).sub(1e18);
        uint256 seigniorage = antTokenSupply.mul(percentage).div(1e18);
        IAntAsset(antToken).mint(address(this), seigniorage);

        // ======================== BIP-3
        uint256 fundReserve = seigniorage.mul(fundAllocationRate).div(100);
        if (fundReserve > 0) {
            IERC20(antToken).safeApprove(fund, fundReserve);
            ISimpleERCFund(fund).deposit(antToken, fundReserve, "Treasury: Seigniorage Allocation");
            emit ContributionPoolFunded(block.timestamp, fundReserve);
        }

        seigniorage = seigniorage.sub(fundReserve);

        // ======================== BIP-4
        uint256 treasuryReserve = Math.min(seigniorage, IERC20(antBond).totalSupply().sub(accumulatedSeigniorage));
        if (treasuryReserve > 0) {
            accumulatedSeigniorage = accumulatedSeigniorage.add(treasuryReserve);
            emit TreasuryFunded(block.timestamp, treasuryReserve);
        }

        // boardroom
        uint256 boardroomReserve = seigniorage.sub(treasuryReserve);
        if (boardroomReserve > 0) {
            IERC20(antToken).safeApprove(boardroom, boardroomReserve);
            IBoardroom(boardroom).allocateSeigniorage(boardroomReserve);
            emit BoardroomFunded(block.timestamp, boardroomReserve);
        }
    }

    // GOV
    event Initialized(address indexed executor, uint256 at);
    event Migration(address indexed target);
    event ContributionPoolChanged(address indexed operator, address newFund);
    event ContributionPoolRateChanged(address indexed operator, uint256 newRate);

    // CORE
    event RedeemedAntBonds(address indexed from, uint256 amount);
    event BoughtAntBonds(address indexed from, uint256 amount);
    event TreasuryFunded(uint256 timestamp, uint256 seigniorage);
    event BoardroomFunded(uint256 timestamp, uint256 seigniorage);
    event ContributionPoolFunded(uint256 timestamp, uint256 seigniorage);
}
