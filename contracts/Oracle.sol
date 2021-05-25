// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "prb-math/contracts/PRBMathUD60x18.sol";

import "./lib/PancakeLibrary.sol";
import "./lib/PancakeOracleLibrary.sol";
import "./utils/Epoch.sol";

import "./interfaces/IPancakePair.sol";

import "./interfaces/IStdReference.sol";

// fixed window oracle that recomputes the average price for the entire period once every period
// note that the price average is only guaranteed to be over at least 1 period, but may be over a longer period
contract Oracle is Epoch {
    event Updated(uint256 price0CumulativeLast, uint256 price1CumulativeLast);

    using SafeMath for uint256;

    struct PriceData {
        address token0;
        address token1;
        uint256 price0CumulativeLast;
        uint256 price1CumulativeLast;
        uint32 blockTimestampLast;
        uint256 price0Average;
        uint256 price1Average;
    }

    PriceData public priceData;
    IPancakePair public pair;
    IStdReference public bandOracle;

    constructor(
        address _factory,
        address _tokenA,
        address _tokenB,
        uint256 _period,
        uint256 _startTime,
        IStdReference _bandOracle
    ) Epoch(_period, _startTime, 0) {
        pair = IPancakePair(PancakeLibrary.pairFor(_factory, _tokenA, _tokenB));

        bandOracle = _bandOracle;

        priceData.token0 = pair.token0();
        priceData.token1 = pair.token1();

        priceData.price0CumulativeLast = pair.price0CumulativeLast();
        priceData.price1CumulativeLast = pair.price1CumulativeLast();

        uint256 reserve0;
        uint256 reserve1;
        (reserve0, reserve1, priceData.blockTimestampLast) = pair.getReserves();

        require(reserve0 != 0 && reserve1 != 0, "Oracle: NO_RESERVES");

        priceData.price0Average = reserve1.mul(1e18).div(reserve0);
        priceData.price1Average = reserve0.mul(1e18).div(reserve1);
    }

    /** @dev Updates 1-day EMA price from PancakeSwap.  */
    function update() external checkEpoch {
        priceData = priceCurrent();
        emit Updated(priceData.price0CumulativeLast, priceData.price1CumulativeLast);
    }

    function antTokenPriceOne() external view returns (uint256) {
        // [workerant]: REVIEW
        return bandOracle.getReferenceData("ANT", "BUSD").rate;
    }

    function price0Last() public view returns (uint256 amountOut) {
        return priceData.price0Average;
    }

    function price1Last() public view returns (uint256 amountOut) {
        return priceData.price1Average;
    }

    function price0Current() public view returns (uint256 amountOut) {
        return priceCurrent().price0Average;
    }

    function price1Current() public view returns (uint256 amountOut) {
        return priceCurrent().price1Average;
    }

    function blockTimestampLast() external view returns (uint32) {
        return priceData.blockTimestampLast;
    }

    function price0CumulativeLast() external view returns (uint256) {
        return priceData.price0CumulativeLast;
    }

    function price1CumulativeLast() external view returns (uint256) {
        return priceData.price1CumulativeLast;
    }

    function pairFor(
        address factory,
        address tokenA,
        address tokenB
    ) external pure returns (address lpt) {
        return PancakeLibrary.pairFor(factory, tokenA, tokenB);
    }

    function priceCurrent() internal view returns (PriceData memory) {
        PriceData memory _priceData = priceData;

        (uint256 price0Cumulative, uint256 price1Cumulative, uint32 blockTimestamp) = PancakeOracleLibrary.currentCumulativePrices(address(pair));
        uint32 timeElapsed = blockTimestamp - _priceData.blockTimestampLast; // overflow is desired

        _priceData.price0Average = PRBMathUD60x18.floor(PRBMathUD60x18.mul(PRBMathUD60x18.div(price0Cumulative - _priceData.price0CumulativeLast, timeElapsed), 1e18));
        _priceData.price0Average = PRBMathUD60x18.floor(PRBMathUD60x18.mul(PRBMathUD60x18.div(price1Cumulative - _priceData.price1CumulativeLast, timeElapsed), 1e18));

        _priceData.price0CumulativeLast = price0Cumulative;
        _priceData.price1CumulativeLast = price1Cumulative;
        _priceData.blockTimestampLast = blockTimestamp;

        return _priceData;
    }
}
