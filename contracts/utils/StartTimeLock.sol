// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

/**
    Utility contract to prevent operations before certain start time has been reached
 */
import "@theanthill/openzeppelin-optimism/contracts/math/SafeMath.sol";

contract StartTimeLock {
    uint256 public startTime;

    /* ========== CONSTRUCTOR ========== */
    constructor(uint256 startTime_) {
        startTime = startTime_;
    }

    /* ========== Modifier ========== */
    modifier checkStartTime {
        require(block.timestamp >= startTime, "StartTimeLock: not started yet");
        _;
    }
}
