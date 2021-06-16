// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
    Generic LP Token Pool with delegated access

    It allows for delegated staking/withdraw on behalf of an origin account. The LP
    tokens transfers are always done between the caller and this contract, but the
    balances of the tokens are shown for the origin account. This allows for a helper
    contract to add liquidity and stake all in one transaction
*/
interface IStakingPoolDelegated  {
    function stake(uint256 amount, address origin_account) external;
    function withdraw(uint256 amount, address origin_account) external;
    function exit(address origin_account) external returns (uint256);
}
