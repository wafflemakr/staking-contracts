// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

interface IUniswapV2ERC20 {
    function permit(address owner, address spender, uint value, uint deadline, uint8 v, bytes32 r, bytes32 s) external;
}