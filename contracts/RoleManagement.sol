// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/access/IAccessControl.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";

/**
 * @notice This contract inherits from [OpenZeppelin's AccessControlEnumerable](https://docs.openzeppelin.com/contracts/4.x/api/access#AccessControlEnumerable).
 *
 * It manages the roles considered in Nut4Health.
 * Identifiers for these roles:
 *
 *    * _Administrator_: `0x0`
 *    * _Screener_: `0x4d61b4f17391ed14d6009f73638b7132d51a652884f17d3aca79a56d17053a6c`
 *    * _Health service_: `0xdee418914a796929f14c4e11785f4a1c3a6e4b4d8b3356de31ad4179de0998d9`
 */
contract RoleManagement is AccessControlEnumerable {
    /// @notice Administrative role: it can configure payments and assign roles
    bytes32 public constant ROLE_ADMIN = DEFAULT_ADMIN_ROLE;
    /// @notice Screener role: it can create diagnosis and receive rewards
    bytes32 public constant ROLE_SCREENER = keccak256("SCREENER");
    /// @notice Health service role: It can validate diagnosis
    bytes32 public constant ROLE_HEALTH_SERVICE = keccak256("HEALTH_SERVICE");

    /// @notice All possible roles considered in this contract
    bytes32[] public ROLES = [
        ROLE_ADMIN,
        ROLE_SCREENER,
        ROLE_HEALTH_SERVICE
    ];

    // Are mappings with firebase IDs hold here or in Firebase?
    // mapping(address => string) private _accountIds;

	constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
		_setRoleAdmin(ROLE_SCREENER, DEFAULT_ADMIN_ROLE);
		_setRoleAdmin(ROLE_HEALTH_SERVICE, DEFAULT_ADMIN_ROLE);
	}
}