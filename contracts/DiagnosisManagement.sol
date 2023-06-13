// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "./IdentifierUtils.sol";
import "./PaymentConfigurationManagement.sol";

/**
 * @notice This contract manages diagnosis.
 */
contract DiagnosisManagement is PaymentConfigurationManagement {
    using IdentifierUtils for string;

    /// @notice Emitted when a diagnosis is registered
    /// @param diagnosisId Identifier of the new diagnosis
    /// @param screener Account which created the diagnosis
    /// @param reward Reward which will be paid if the diagnosis is validated
    event DiagnosisCreated(string diagnosisId, address screener, uint32 reward);

    /// @notice Emitted when a diagnosis is invalidated
    /// @param diagnosisId Identifier of the invalidated diagnosis
    /// @param validator Account which invalidated the diagnosis
    event DiagnosisInvalidated(string diagnosisId, address validator);

    /// @notice Emitted when a diagnosis is validated
    /// @param diagnosisId Identifier of the validated diagnosis
    /// @param validator Account which validated the diagnosis
    event DiagnosisValidated(string diagnosisId, address validator);

    /// @notice Emitted when a diagnosis is paid
    /// @param diagnosisId Identifier of the paid diagnosis
    event DiagnosisPaid(string diagnosisId);

    enum DiagnosisStatus{ UNEXISTING, REGISTERED, INVALIDATED, VALIDATED, PAID }

    /// @dev Mapping that stores diagnoses by their identifiers
    mapping(bytes32 => Diagnosis) private diagnoses;

    struct Diagnosis {
        DiagnosisStatus status;
        address screener;
        bytes32 assignedHealthCentreId;
        address validador;
        uint32 reward;
    }

    /// @notice It returns the details of a diagnosis
    /// @param diagnosisId Identifier of the diagnosis to be checked
    /// @return status Status of the diagnosis: 0 (UNEXISTING), 1 (REGISTERED),
    ///                     2 (INVALIDATED), 3 (VALIDATED) and 4 (PAID)
    function getDiagnosisDetails(string calldata diagnosisId) external view returns (uint32 status) {
        Diagnosis storage diagnosis = diagnoses[diagnosisId.toInternalId()];
        status = uint32(diagnosis.status);
    }

    /// @notice It registers a new diagnosis
    /// @dev Only a screener account can execute this method
    /// @param diagnosisId Identifier of the diagnosis in the backend
    /// @param healthCentreId Identifier of the assigned health centre
    function registerDiagnosis(string calldata diagnosisId, string calldata healthCentreId) external onlyRole(ROLE_SCREENER) {
        bytes32 internalCentreId = healthCentreId.toInternalId(); // might revert transaction
        require(_exists(internalCentreId), "Unexisting health centre");

        Diagnosis storage diagnosis = diagnoses[diagnosisId.toInternalId()];
        require(diagnosis.status == DiagnosisStatus.UNEXISTING, "Already registered diagnosis");

        diagnosis.status = DiagnosisStatus.REGISTERED;   
        diagnosis.assignedHealthCentreId = internalCentreId;
        diagnosis.screener = _msgSender();
        // The current price during registration is assigned as a reward
        diagnosis.reward = _getPaymentConfigurationForScreener(diagnosis.screener).price; 

        emit DiagnosisCreated(diagnosisId, diagnosis.screener, diagnosis.reward);
    }

    /// @notice It set a validator of a diagnosis if it meets the requirements
    /// @dev The diagnosis must be in "registered" status and the calling account must belong to its associated health centre
    /// @param diagnosis Diagnosis whose validator will be updated
    function _assignValidator(Diagnosis storage diagnosis) private onlyRole(ROLE_HEALTH_SERVICE) {
        require(diagnosis.status == DiagnosisStatus.REGISTERED, "Diagnosis must be in 'registered' status");
        
        diagnosis.validador = _msgSender();
        require(_belongsToHealthCentre(diagnosis.validador, diagnosis.assignedHealthCentreId), "Health service not assigned to diagnosis' health centre");
    }

    /// @notice It invalidates a given diagnosis
    /// @dev Only a health service account can execute this method and the diagnosis must exist
    /// @param diagnosisId Identifier of the diagnosis to be validated
    function invalidateDiagnosis(string calldata  diagnosisId) external {
        Diagnosis storage diagnosis = diagnoses[diagnosisId.toInternalId()];
        _assignValidator(diagnosis);
        diagnosis.status = DiagnosisStatus.INVALIDATED;
        emit DiagnosisInvalidated(diagnosisId, diagnosis.validador);
    }

    /// @notice It validates a given diagnosis and (if possible) pays its reward to the screener
    /// @dev Only a health service account can execute this method and the diagnosis must exist
    /// @param diagnosisId Identifier of the diagnosis to be validated
    function validateDiagnosis(string calldata diagnosisId) external onlyRole(ROLE_HEALTH_SERVICE) {
        Diagnosis storage diagnosis = diagnoses[diagnosisId.toInternalId()];
        _assignValidator(diagnosis);

        bool success = _payReward(diagnosis.screener, diagnosis.reward);
        if (success) {
            diagnosis.status = DiagnosisStatus.PAID;
        } else {
            diagnosis.status = DiagnosisStatus.VALIDATED;
        }

        emit DiagnosisValidated(diagnosisId, diagnosis.validador);
    }

    /// @notice It pays any reward pending to be paid for a given diagnosis
    /// @dev Only an admin account can execute this method and the diagnosis must exist
    /// @param diagnosisId Identifier of the diagnosis to be validated
    function payReward(string calldata diagnosisId) external onlyRole(ROLE_ADMIN) {
        // Important pattern to match: checks-effects-interactions

        // Checks
        Diagnosis storage diagnosis = diagnoses[diagnosisId.toInternalId()];
        require(diagnosis.status == DiagnosisStatus.VALIDATED, "Diagnosis must be in 'validated' status");

        // Effects
        diagnosis.status = DiagnosisStatus.PAID;

        // Interactions
        _payRewardOrFail(diagnosis.screener, diagnosis.reward);
        emit DiagnosisPaid(diagnosisId);
    }
}
