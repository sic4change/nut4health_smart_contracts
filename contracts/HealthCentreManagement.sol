// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "./IdentifierUtils.sol";
import "./RoleManagement.sol";

/**
 * @notice This contract manages health center locations and the assigned
 * health service accounts.
 */
contract HealthCentreManagement is RoleManagement {
    using IdentifierUtils for string;

    /// @notice Emitted when health center is registered
    /// @param healthCentreId Identifier of the new health centre
    event HealthCentreCreated(string healthCentreId);

    /// @notice Emitted when a health service is assigned to a health center
    /// @param healthService Account assigned to the health centre
    /// @param healthCentreId Identifier of the health centre
    event HealthServiceAssigned(address healthService, string healthCentreId);

    /// @dev Mapping that stores the health center assigned to each health service account
    mapping(address => bytes32) private assignedCentre;

    /// @dev Mapping that stores the health service for a given id
    mapping(bytes32 => HealthCentre) private healthCentres;

    struct HealthCentre {
        bool initialized;
        // TODO Do we need to store associated info?
    }

    /// @notice It creates a health centre
    /// @dev Only an admin account can execute this method
    /// @param healthCentreId Health centre identifier. It cannot be empty.
    function createHealthCentre(string calldata healthCentreId) external onlyRole(ROLE_ADMIN) {
        HealthCentre storage centre = healthCentres[healthCentreId.toInternalId()];
        require(!centre.initialized, "There is already a centre with the provided ID");
        centre.initialized = true;
        emit HealthCentreCreated(healthCentreId);
    }

    /// @notice It checks whether an account is assigned to a health centre
    /// @dev Only an admin account can execute this method. Account must have a health service role and health centre exist.
    /// @param account Account to assign to existing health centre
    /// @param healthCentreId Health centre identifier
    function assignToHealthCentre(address account, string calldata healthCentreId) external onlyRole(ROLE_ADMIN) {
        assignedCentre[account] = healthCentreId.toInternalId();
        HealthCentre storage centre = healthCentres[assignedCentre[account]];

        require(centre.initialized, "Unexisting health centre");
        require(hasRole(ROLE_HEALTH_SERVICE, account), "The assigned account must have a health service role");

        emit HealthServiceAssigned(account, healthCentreId);
    }

    /**
     * @notice It revokes the role to the provided account and if it is a health service, it removes it from the health centre.
     * @dev See more details in the 
     *   <a href="https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControl-revokeRole-bytes32-address-">
     *   official OpenZeppelin documentation</a>.
     * @param role Identifier of role to be revoked
     * @param account Address of the account
     */
    function revokeRole(bytes32 role, address account) public override(IAccessControl, AccessControl) virtual onlyRole(ROLE_ADMIN) {
        super.revokeRole(role, account);
        if (hasRole(ROLE_HEALTH_SERVICE, account)) {
            delete assignedCentre[account];
        }
    }

    /**
     * @notice It revokes the role from the calling account and if it is a health service, it removes it from the health centre.
     * @dev See more details in the 
     *   <a href="https://docs.openzeppelin.com/contracts/4.x/api/access#IAccessControl-renounceRole-bytes32-address-">
     *   official OpenZeppelin documentation</a>.
     * @param role Identifier of role to be revoked
     * @param account Address of the account
     */
    function renounceRole(bytes32 role, address account) public override(IAccessControl, AccessControl) virtual onlyRole(ROLE_ADMIN) {
        super.renounceRole(role, account);
        if (hasRole(ROLE_HEALTH_SERVICE, account)) {
            delete assignedCentre[account];
        }
    }

    /// @notice It checks whether a health centre exists
    /// @dev Internal function
    /// @param healthCentreId Health centre internal identifier
    /// @return bool Does the health centre with the provided identifier exist?
    function _exists(bytes32 healthCentreId) internal view returns (bool) {
        HealthCentre storage centre = healthCentres[healthCentreId];
        return centre.initialized;
    }

    /// @notice It checks whether an account is assigned to a health centre
    /// @dev Internal function
    /// @param account Account to check
    /// @param healthCentreId Health centre identifier
    /// @return bool Is the account assigned to the health centre?
    function _belongsToHealthCentre(address account, bytes32 healthCentreId) internal view returns (bool) {
        bytes32 assignedCentreId = assignedCentre[account];
        return healthCentreId == assignedCentreId;
    }
}
