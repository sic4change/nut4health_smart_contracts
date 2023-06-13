// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @notice Sample ERC20 token used only in tests.
 * @dev You can ignore this contract in the deployment.
 */
contract SampleToken is Ownable, ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    /// @notice It issues/mints an amount and transfer it to the specified account.
    /// @param account Account which will own the new token
    /// @param amount Amount of token to be issued/minted
    function issue(address account, uint256 amount) public onlyOwner returns (bool) {
        _mint(account, amount);
        return true;
    }
}
