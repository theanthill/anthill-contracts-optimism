// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ILinkOracle {
    function latestAnswer() external view returns (int256);
}
