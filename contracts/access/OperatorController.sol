// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
    Interface
 */
interface IOperatorController
{
    function isOperator(address account) external view returns (bool);
    function transferOperator(address newOperator) external;
}

/**
    Basic access control for a contract that defines an Admin and an Operator roles

        - Admin can transfer the Operator to a new account or add new Operator
        - Operator can perform calls to all functiones marked as onlyOperator()
 */
abstract contract OperatorController is IOperatorController, AccessControl {
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    address private _operator;

    // ==== CONSTRUCTOR ==== 
    constructor() {
        _setRoleAdmin(ADMIN_ROLE, ADMIN_ROLE);
        _setRoleAdmin(OPERATOR_ROLE, ADMIN_ROLE);

        _operator = _msgSender();

        _setupRole(ADMIN_ROLE, _operator);
        _setupRole(OPERATOR_ROLE, _operator);
    }

    // ==== MODIFIERS ==== 
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, _msgSender()), "OperatorControl: sender requires permission");
        _;
    }

    // ==== VIEWS ==== 
    function isOperator(address account) external override view returns (bool) {
        return hasRole(OPERATOR_ROLE, account);
    }

    // ==== MUTABLES ==== 
    function transferOperator(address newOperator) external override {
        require(newOperator != address(0), "OperatorControl: zero address given for new operator");
        
        _operator = newOperator;

        revokeRole(OPERATOR_ROLE, _operator);
        grantRole(OPERATOR_ROLE, newOperator);
    }
}
