// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./HealthCentreManagement.sol";

/**
 * @notice This contract manages and interacts with the configured ERC20 token.
 */
contract RewardManagement is HealthCentreManagement {
    /// @notice Emitted when new token or owner is configured to pay rewards
    /// @param token Address of the [ERC20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20/)-compliant smart-contract to be used as token
    /// @param owner Address of the owner of the tokens that this smart-contract may spend
    event TokenUpdated(address token, address owner);

    /// @dev ERC20 token to be used to pay rewards
    ERC20 private token;

    /// @dev Token owner that must have allowed current contract to spend token on its behalf
    address private tokenOwner;

    /// @notice It defines a new token and owner to be used for payments
    /// @dev Only an admin account can execute this method
    /// @param _token Address of the ERC20-compliant smart-contract to be used as token
    /// @param _owner Address of the owner of the tokens that this smart-contract will be spending
    function setToken(address _token, address _owner) external onlyRole(ROLE_ADMIN) {
        token = ERC20(_token);
        tokenOwner = _owner;
        emit TokenUpdated(_token, _owner);
    }

    /// @notice It invokes token transfer and, if it fails, makes the whole transaction fail
    /// @dev Internal function
    /// @param to Address of the account which will receive the token
    /// @param amount Amount of token to be transferred
    function _payRewardOrFail(address to, uint256 amount) internal {
        token.transferFrom(tokenOwner, to, amount);
    }

    /// @notice It invokes token transfer without making the whole transaction fail
    /// @dev Internal function
    /// @param to Address of the account which will receive the token
    /// @param amount Amount of token to be transferred
    /// @return bool Did the token transfer succeed?
    function _payReward(address to, uint256 amount) internal returns(bool) {
        if (address(token) == address(0)) {
            return false;
        }

        // https://consensys.github.io/smart-contract-best-practices/development-recommendations/general/external-calls/#handle-errors-in-external-calls
        (bool success,) = address(token).call(abi.encodeWithSignature("transferFrom(address,address,uint256)", tokenOwner, to, amount));
        return success;
    }
}
