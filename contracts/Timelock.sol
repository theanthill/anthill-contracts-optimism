// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract Timelock is TimelockController {
    address public admin;
    address public pendingAdmin;
    uint256 public delay;

    constructor(uint256 minDelay, address[] memory admins) TimelockController(minDelay, admins, admins) {
    }
}
