// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOracle {
    
    function update() external;

    /**
        Returns the latest updated average price for the given token

        @param token   Address of the token to get the average price for

        @return price  Average price of the token multiplied by 1e18
    */
    function priceAverage(address token) external view returns (uint256);

    /**
        Returns the latest known price from the external oracle for the given token

        @param token   Address of the token to get the latest external price for

        @return price  Latest external price of the token multiplied by 1e18
    */
    function priceExternal(address token) external view returns (uint256);

     /**
        Calculates the percentage of the price variation between the internal liquidity price
        and the external Oracle price

        @param token   Address of the token to get price variation for

        @return percentage  Price variation percentage multiplied by 1e18
    */
    function priceVariationPercentage(address token) external view returns(uint256);
    
    function consult(address token, uint amountIn) external view returns (uint256);
}