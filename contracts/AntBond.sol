// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./core/BaseToken.sol";

contract AntBond is BaseToken {
    /**
     * @notice Constructs the Ant Token AntBond ERC-20 contract.
     */
    constructor() BaseToken("AntBond", "ANTB") {}
}
