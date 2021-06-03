// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../owner/Operator.sol";

contract MockBNB is ERC20Burnable, Operator {
    /**
     * @notice Constructs the Ant Token ERC-20 contract.
     */
    constructor() ERC20("BNB", "BNB") {}

    /**
     * @notice Operator mints dino antToken to a recipient
     * @param recipient_ The address of recipient
     * @param amount_ The amount of dino antToken to mint to
     * @return whether the process has been done
     */
    function mint(address recipient_, uint256 amount_) public onlyOperator returns (bool) {
        uint256 balanceBefore = balanceOf(recipient_);
        _mint(recipient_, amount_);
        uint256 balanceAfter = balanceOf(recipient_);

        return balanceAfter > balanceBefore;
    }
}
