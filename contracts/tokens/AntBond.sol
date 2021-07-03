// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Token used when in deflationary period
 */

import "../core/BaseToken.sol";

contract AntBond is BaseToken {
    constructor() BaseToken("AntBond", "ANTB") {}
}
