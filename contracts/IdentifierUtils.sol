// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

/**
 * @notice This library converts external identifiers used in the Nut4Health system
 * to identifiers which can be used internally by the contracts.
 * Using the bytes32 type we can easily compare two identifiers.
 */
library IdentifierUtils {
    /// @notice It returns string identifier in bytes32 format
	/// @dev Internal function
	/// @param healthCentreId Health centre identifier. It cannot be an empty string.
	/// @return bytes32 Hash of the provided identifier
	function toInternalId(string calldata healthCentreId) internal pure returns (bytes32) {
		require(bytes(healthCentreId).length != 0, "An empty string is not a valid id");
		return keccak256(abi.encodePacked((healthCentreId)));
	}
}