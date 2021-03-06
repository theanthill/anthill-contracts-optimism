// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "@theanthill/openzeppelin-optimism/contracts/token/ERC20/IERC20.sol";

interface IERC20Extended is IERC20 {
    function symbol() external view returns (string memory);

    function name() external view returns (string memory);

    function decimals() external view returns (uint8);
}
