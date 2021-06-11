// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Base contract for the tokens in the system

    All tokens are burnable and have an operator
 */
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "../owner/Operator.sol";

contract BaseToken is ERC20Burnable, Operator {
    constructor(string memory name_, string memory symbol_) ERC20(name_, symbol_) {}

    function mint(address recipient_, uint256 amount_) public onlyOperator {
        _mint(recipient_, amount_);
    }

    function burn(uint256 amount) public override onlyOperator {
        super.burn(amount);
    }

    function burnFrom(address account, uint256 amount) public override onlyOperator {
        super.burnFrom(account, amount);
    }
}