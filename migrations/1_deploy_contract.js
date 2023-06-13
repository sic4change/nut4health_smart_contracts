// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const Nut4Health = artifacts.require("./Nut4Health.sol")

module.exports = function (deployer) {
  deployer.deploy(Nut4Health)
}
