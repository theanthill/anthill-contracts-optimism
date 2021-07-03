// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * Monetary policy logic to adjust supplies of Ant token assets
 */

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import "./Boardroom.sol";
import "./Oracle.sol";
import "./ContributionPool.sol";

import "../core/BaseToken.sol";

import "../access/OperatorAccessControl.sol";

import "../utils/EpochCounter.sol";
import "../utils/ContractGuard.sol";

contract Treasury is ContractGuard, EpochCounter {
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
        uint256 _startTime,
        uint256 _period
    ) EpochCounter(_period, _startTime, 0) {
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
            IOperatorAccessControl(antToken).isOperator(address(this)) &&
                IOperatorAccessControl(antBond).isOperator(address(this)) &&
                IOperatorAccessControl(antShare).isOperator(address(this)) &&
                IOperatorAccessControl(boardroom).isOperator(address(this)),
            "Treasury: need more permission"
        );

        _;
    }

    /* ========== VIEW FUNCTIONS ========== */

    // budget
    function getReserve() public view returns (uint256) {
        return accumulatedSeigniorage;
    }

    function tokenPriceTWAP() public view returns (uint256) {
        try oracle.priceTWAP(antToken) returns (uint256 price) {
            return price;
        } catch {
            revert("Treasury: failed to consult Ant Token swap price from the oracle");
        }
    }

    function priceDollar() public view returns (uint256) {
        try oracle.priceDollar() returns (uint256 price) {
            return price;
        } catch {
            revert("Treasury: failed to consult Ant Token external price from the oracle");
        }
    }

    /**
        Calculates the ceiling for the token price. This is a 5% more on the actual
        externally evaluated price of the token

        @return The ceiling price multiplied by 1e18
    */
    function tokenPriceCeiling() public view returns (uint256) {
        return oracle.priceDollar().mul(uint256(105)).div(100);
    }

    function migrate(address target) public onlyOperator checkOperator {
        require(!migrated, "Treasury: migrated");

        // Ant Token
        IOperatorAccessControl(antToken).transferOperator(target);
        IERC20(antToken).transfer(target, IERC20(antToken).balanceOf(address(this)));

        // Ant Bond
        IOperatorAccessControl(antBond).transferOperator(target);
        IERC20(antBond).transfer(target, IERC20(antBond).balanceOf(address(this)));

        // share
        IOperatorAccessControl(antShare).transferOperator(target);
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

    /**
        Calls the orable to update the latest price
    */
    function _updateAntTokenPrice() internal {
        try oracle.update() {} catch {
            // Update will revert if called twice in less than the allocated period, so
            // just ignore the error if that happens
        }
    }

    /**
        Buys Ant Bonds with Ant Tokens

        Ant Tokens are burned and Ant Bonds are minted to the sender's account in a
        ratio of 1:(targetPrice/externalPrice)

        @param amountAntToken Amount of Ant Tokens to burn in order to get the bonds
        @param targetPrice Target price at which the bonds will be purchased
    */
    function buyAntBonds(uint256 amountAntToken, uint256 targetPrice)
        external
        onlyOneBlock
        checkMigration
        checkStartTime
        checkOperator
    {
        require(amountAntToken > 0, "Treasury: cannot purchase antBonds with zero amount");

        uint256 antTokenPrice = tokenPriceTWAP();
        uint256 dollarPrice = priceDollar();

        require(antTokenPrice == targetPrice, "Treasury: Ant Token price moved");
        require(antTokenPrice < dollarPrice, "Treasury: Ant Token price not eligible for Ant Bond redemption");

        // Price ratio with 1e18 decimals
        uint256 priceRatio = antTokenPrice.mul(1e18).div(dollarPrice);
        uint256 amountBonds = amountAntToken.mul(1e18).div(priceRatio);

        IBaseToken(antToken).burnFrom(_msgSender(), amountAntToken);
        IBaseToken(antBond).mint(_msgSender(), amountBonds);

        _updateAntTokenPrice();

        emit BoughtAntBonds(_msgSender(), amountAntToken);
    }

    /**
        Redeems Ant Bonds for Ant Tokens

        Ant Bonds are burned and Ant Tokens are transferred to the sender's account in a ratio of 1:1

        @param amountAntBonds Amount of Ant Tokens to burn in order to get the bonds
        @param targetPrice Target price at which the bonds will be redeemed
    */
    function redeemAntBonds(uint256 amountAntBonds, uint256 targetPrice)
        external
        onlyOneBlock
        checkMigration
        checkStartTime
        checkOperator
    {
        require(amountAntBonds > 0, "Treasury: cannot redeem antBonds with zero amount");

        uint256 tokenPrice = tokenPriceTWAP();

        require(tokenPrice == targetPrice, "Treasury: Ant Token price moved");
        require(tokenPrice > tokenPriceCeiling(), "Treasury: Ant Token price not eligible for Ant Bond redemption");
        require(
            IERC20(antToken).balanceOf(address(this)) >= amountAntBonds,
            "Treasury: treasury has no more budget for Ant Bonds redemption"
        );

        accumulatedSeigniorage = accumulatedSeigniorage.sub(Math.min(accumulatedSeigniorage, amountAntBonds));

        IBaseToken(antBond).burnFrom(_msgSender(), amountAntBonds);
        IERC20(antToken).safeTransfer(_msgSender(), amountAntBonds);

        _updateAntTokenPrice();

        emit RedeemedAntBonds(_msgSender(), amountAntBonds);
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

        uint256 tokenPrice = tokenPriceTWAP();

        if (tokenPrice <= tokenPriceCeiling()) {
            return; // Just advance epoch instead of revert
        }

        // Calculate current circulating supply and new supply to be minted
        uint256 currentSupply = IERC20(antToken).totalSupply().sub(accumulatedSeigniorage);
        uint256 percentage = oracle.priceVariationPercentage(antToken);
        uint256 additionalAntTokenSupply = currentSupply.mul(percentage).div(1e18);

        IBaseToken(antToken).mint(address(this), additionalAntTokenSupply);

        // Contribution Pool Reserve: allocate fundAllocationRate% from the new extra supply to the fund
        uint256 fundReserve = additionalAntTokenSupply.mul(fundAllocationRate).div(100);
        if (fundReserve > 0) {
            IERC20(antToken).safeIncreaseAllowance(fund, fundReserve);
            IContributionPool(fund).deposit(antToken, fundReserve, "Treasury: Seigniorage Allocation");

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
            IERC20(antToken).safeIncreaseAllowance(boardroom, boardroomReserve);
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
