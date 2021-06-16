// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IBaseToken is IERC20 {
    function mint(address recipient, uint256 amount) external returns (bool);
    function burn(uint256 amount) external;
    function burnFrom(address from, uint256 amount) external;
    function operator() external view returns (address);
    function symbol() external view returns (string memory);
}
