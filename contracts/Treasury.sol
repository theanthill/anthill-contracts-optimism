// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Boardroom.sol";
import "./Oracle.sol";
import "./ContributionPool.sol";

import "./core/BaseToken.sol";

import "./access/OperatorController.sol";

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
    
    /* ========== STATE ========== */
    // Flags
    bool public migrated = false;
    bool public initialized = false;

    // Core
    address public fund;
    address public antToken;
    address public antBond;
    address public antShare;
    address public boardroom;
    IOracle public oracle;

    // Parameters
    uint256 private accumulatedSeigniorage = 0;
    uint256 public fundAllocationRate = 2; // %

    constructor(
        address _antToken,
        address _antBond,
        address _antShare,
        IOracle _oracle,
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
        oracle = _oracle;

        boardroom = _boardroom;
        fund = _fund;
    }

    modifier checkMigration {
        require(!migrated, "Treasury: migrated");

        _;
    }

    modifier checkOperator {
        require(
            IOperatorController(antToken).isOperator(address(this)) &&
            IOperatorController(antBond).isOperator(address(this)) &&
            IOperatorController(antShare).isOperator(address(this)) &&
            IOperatorController(boardroom).isOperator(address(this)),
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
        try oracle.priceAverage(antToken) returns (uint256 price) {
            return price;
        } catch {
            revert("Treasury: failed to consult antToken price from the oracle");
        }
    }

    /**
        Calculates the ceiling for the token price. This is a 5% more on the actual
        externally evaluated price of the token

        @return The ceiling price multiplied by 1e18
    */
    function antTokenPriceCeiling() public view returns (uint256) {
        return oracle.priceExternal(antToken).mul(uint256(105)).div(100);
    }

    function migrate(address target) public onlyOperator checkOperator {
        require(!migrated, "Treasury: migrated");

        // Ant Token
        IOperatorController(antToken).transferOperator(target);
        IERC20(antToken).transfer(target, IERC20(antToken).balanceOf(address(this)));

        // Ant Bond
        IOperatorController(antBond).transferOperator(target);
        IERC20(antBond).transfer(target, IERC20(antBond).balanceOf(address(this)));

        // share
        IOperatorController(antShare).transferOperator(target);
        IERC20(antShare).transfer(target, IERC20(antShare).balanceOf(address(this)));

        migrated = true;
        emit Migration(target);
    }

    function setFund(address newFund) public onlyOperator {
        fund = newFund;
        emit ContributionPoolChanged(_msgSender(), newFund);
    }

    function setFundAllocationRate(uint256 rate) public onlyOperator {
        fundAllocationRate = rate;
        emit ContributionPoolRateChanged(_msgSender(), rate);
    }

    /* ========== MUTABLE FUNCTIONS ========== */

    function _updateAntTokenPrice() internal {
        try oracle.update() {
        } catch {
            revert("Error updating price from Oracle");
        }
    }

    function buyAntBonds(uint256 amount, uint256 targetPrice) external onlyOneBlock checkMigration checkStartTime checkOperator {
        require(amount > 0, "Treasury: cannot purchase antBonds with zero amount");

        uint256 antTokenPrice = getAntTokenPrice();
        uint256 antTokenPriceExternal = oracle.priceExternal(antToken);

        require(antTokenPrice == targetPrice, "Treasury: antToken price moved");
        require(antTokenPrice < antTokenPriceExternal, "Treasury: antTokenPrice not eligible for antBond purchase");

        uint256 priceRatio = antTokenPrice.mul(1e18).div(antTokenPriceExternal);
        IBaseToken(antToken).burnFrom(_msgSender(), amount);
        IBaseToken(antBond).mint(_msgSender(), amount.mul(1e18).div(priceRatio));

        _updateAntTokenPrice();

        emit BoughtAntBonds(_msgSender(), amount);
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

        IBaseToken(antBond).burnFrom(_msgSender(), amount);
        IERC20(antToken).safeTransfer(_msgSender(), amount);
        _updateAntTokenPrice();

        emit RedeemedAntBonds(_msgSender(), amount);
    }

    /**
        Calculates how many new Ant Tokens must be minted to bring the price down to the target price:
            - If the price is lower than the price celing (target price * 1.05) it does nothing
            - Fetches the price variation percentage and multiplies the current total supply minus
              the Treasury allocated tokens by the percentage to obtain the new extra supply to mint
            - From the new supply a 2% is removed for the Contribution Pool
            - The Treasury itself gets an amount calculated from the minimum of the new supply and
              the circulating bonds minus the Treasury current accumulated Seigniorage
            - Finally the Boardroom gets the rest of the new supply
     */
    function allocateSeigniorage() external onlyOneBlock checkMigration checkStartTime checkEpoch checkOperator {
        _updateAntTokenPrice();

        uint256 antTokenPriceSwap = getAntTokenPrice();

        if (antTokenPriceSwap <= antTokenPriceCeiling()) {
            return; // Just advance epoch instead revert
        }
      
        // Calculate current circulating supply and new supply to be minted
        uint256 currentSupply = IERC20(antToken).totalSupply().sub(accumulatedSeigniorage);
        uint256 percentage = oracle.priceVariationPercentage(antToken);
        uint256 additionalAntTokenSupply = currentSupply.mul(percentage).div(1e18);

        IBaseToken(antToken).mint(address(this), additionalAntTokenSupply);

        // Contribution Pool Reserve: allocate fundAllocationRate% from the new extra supply to the fund
        uint256 fundReserve = additionalAntTokenSupply.mul(fundAllocationRate).div(100);
        if (fundReserve > 0) {
            IERC20(antToken).safeApprove(fund, fundReserve);
            ISimpleERCFund(fund).deposit(antToken, fundReserve, "Treasury: Seigniorage Allocation");
            
            additionalAntTokenSupply = additionalAntTokenSupply.sub(fundReserve);

            emit ContributionPoolFunded(block.timestamp, fundReserve);
        }

        // Treasury Reserve
        uint256 availableBondSupply = IERC20(antBond).totalSupply().sub(accumulatedSeigniorage);
        uint256 treasuryReserve = Math.min(additionalAntTokenSupply, availableBondSupply);
        if (treasuryReserve > 0) {
            accumulatedSeigniorage = accumulatedSeigniorage.add(treasuryReserve);

            emit TreasuryFunded(block.timestamp, treasuryReserve);
        }

        // Boardroom Reserve: the rest of the new supply is allocated to the Boardroom
        uint256 boardroomReserve = additionalAntTokenSupply.sub(treasuryReserve);
        if (boardroomReserve > 0) {
            IERC20(antToken).safeApprove(boardroom, boardroomReserve);
            IBoardroom(boardroom).allocateSeigniorage(boardroomReserve);

            emit BoardroomFunded(block.timestamp, boardroomReserve);
        }
    }

    // GOV
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
