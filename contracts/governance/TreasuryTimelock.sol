// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

/**
    Timelock contract for all operations managed by the Treasury account
 */

import "@theanthill/openzeppelin-optimism/contracts/access/TimelockController.sol";

import "../access/AdminAccessControl.sol";

contract TreasuryTimelock is TimelockController, AdminAccessControlHelper {
    constructor(uint256 minDelay, address[] memory admins)
        TimelockController(minDelay, admins, admins)
        AdminAccessControlHelper(TIMELOCK_ADMIN_ROLE, _msgSender())
    {}
}
