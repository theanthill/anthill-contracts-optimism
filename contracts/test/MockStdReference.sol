// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IStdReference.sol";

contract MockStdReference is IStdReference {
    uint256 testRate = 1e18;

    /// Returns the price data for the given base/quote pair. Revert if not available.
    function getReferenceData(
        string memory, /*_base*/
        string memory /*_quote*/
    ) external view override returns (ReferenceData memory) {
        ReferenceData memory data;

        data.rate = testRate;
        data.lastUpdatedBase = 0;
        data.lastUpdatedQuote = 0;

        return data;
    }

    /// Similar to getReferenceData, but with multiple base/quote pairs at once.
    function getReferenceDataBulk(
        string[] memory _bases,
        string[] memory /*_quotes*/
    ) external view override returns (ReferenceData[] memory) {
        ReferenceData[] memory data = new ReferenceData[](_bases.length);

        for (uint256 i = 0; i < data.length; ++i) {
            data[i].rate = testRate;
            data[i].lastUpdatedBase = 0;
            data[i].lastUpdatedQuote = 0;
        }

        return data;
    }

    function setTestRate(uint256 rate) external {
        testRate = rate;
    }
}
