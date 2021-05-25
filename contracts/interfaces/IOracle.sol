// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IOracle {
    function update() external;

    // function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestamp);

    function antTokenPriceOne() external view returns (uint256);

    function price0Last() external view returns (uint256);

    function price1Last() external view returns (uint256);
}
