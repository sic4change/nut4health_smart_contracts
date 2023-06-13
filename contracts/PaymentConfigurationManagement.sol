// SPDX-License-Identifier: TECNALIA
// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

pragma solidity ^0.8.17;

import "./RewardManagement.sol";

/**
 * @notice This contract manages payment configurations.
 */
contract PaymentConfigurationManagement is RewardManagement {
    /// @notice Emitted when payment configuration is registered or updated
    /// @param configurationId Identifier of the configuration
    /// @param price Price associated to the payment configuration
    event PaymentUpdated(uint32 configurationId, uint32 price);

    // Note: SafeMath is generally not needed starting with Solidity 0.8, since the compiler now has built in overflow checking.
    // Starts in 1, so we can know whether a configuration has been assigned to an screener (id != 0)
    uint32 private lastId = 1;

    /// @dev Mapping that stores the current price (in token units) for a given configuration id
    mapping(uint32 => PaymentConfiguration) private configurations;

    /// @dev Mapping that stores the configuration id for a screener account
    mapping(address => uint32) private screenerConfigurations;

    // If price couldn't be zero, we could directly use uint32 (instead of "initialized")
    // and check if configuration exists with != 0
    struct PaymentConfiguration {
        bool initialized;
        uint32 price;
    }

    /// @notice It creates a new payment configuration
    /// @dev Only an admin account can execute this method
    /// @param initialPrice Initial price for the new payment configuration
    function addPaymentConfiguration(uint32 initialPrice) external onlyRole(ROLE_ADMIN) {
        PaymentConfiguration storage config = configurations[lastId];
        config.initialized = true;
        config.price = initialPrice;
        emit PaymentUpdated(lastId, initialPrice);
        lastId = lastId + 1;
    }

    /// @notice It retrieves an stored PaymentConfiguration
    /// @dev Internal function
    /// @param configurationId Identifier of the payment configuration to be retrieved
    /// @return PaymentConfiguration associated to the configurationId
    function _getPaymentConfiguration(uint32 configurationId) internal view returns (PaymentConfiguration storage) {
        PaymentConfiguration storage config = configurations[configurationId];
        require(config.initialized, "No payment configuration found");
        return config;
    }

    /// @notice It retrieves an stored PaymentConfiguration associated with an screener account
    /// @dev Internal function
    /// @param screener Address of the screener account whose associated payment configuration we want to obtain
    /// @return PaymentConfiguration associated to the screener account
    function _getPaymentConfigurationForScreener(address screener) internal view returns (PaymentConfiguration storage) {
        uint32 configurationId = screenerConfigurations[screener];
        require(configurationId != 0, "No payment configuration assigned to screener");
        return _getPaymentConfiguration(configurationId);
    }

    /// @notice It modifies the price associated to an existing payment configuration
    /// @dev Only an admin account can execute this method and a payment configuration must exist
    /// @param configurationId Identifier of the payment configuration to be modified
    /// @param price Price to be taken into account from this point on
    function updatePrice(uint32 configurationId, uint32 price) external onlyRole(ROLE_ADMIN) {
        PaymentConfiguration storage config = _getPaymentConfiguration(configurationId);
        config.price = price;
        emit PaymentUpdated(configurationId, price);
    }

    /// @notice It modifies the price associated to an existing payment configuration
    /// @dev Only an admin account can execute this method and a payment configuration must exist
    /// @param screener Screener account
    /// @param configurationId Identifier of the payment configuration to be assigned to the screener account
    function setScreenerConfiguration(address screener, uint32 configurationId) external onlyRole(ROLE_ADMIN) {
        require(hasRole(ROLE_SCREENER, screener), "The provided account is not an screener");
        _getPaymentConfiguration(configurationId); // To check its existance
        screenerConfigurations[screener] = configurationId;
    }
}
