// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/presets/ERC20PresetMinterPauser.sol";

/**
 * @title Rewards token for Synthetix Staking contracts
 */
contract RewardsToken is ERC20PresetMinterPauser {
    constructor() public ERC20PresetMinterPauser("Rewards Token", "RT"){}
}