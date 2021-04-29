// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

/**
 * @title Mock contract for ETHA ERC20 Token
 */
contract LPToken is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("LPToken", "LP"){}
}