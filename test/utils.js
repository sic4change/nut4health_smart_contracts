// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const { BN, constants } = require("@openzeppelin/test-helpers")

const getHash = str => web3.utils.keccak256(str)

const ROLE_ADMIN = constants.ZERO_BYTES32
const ROLE_SCREENER = getHash("SCREENER")
const ROLE_HEALTH_SERVICE = getHash("HEALTH_SERVICE")

const DIAGNOSIS_STATUS_UNEXISTING = new BN("0")
const DIAGNOSIS_STATUS_REGISTERED = new BN("1")
const DIAGNOSIS_STATUS_INVALIDATED = new BN("2")
const DIAGNOSIS_STATUS_VALIDATED = new BN("3")
const DIAGNOSIS_STATUS_PAID = new BN("4")

const MINTED_TOKENS = 1e9

// In seconds
const getNow = () => Math.floor(Date.now() / 1000)

const IDENTITY_FUNCTION = t => t

const extractAttrFromEvent = (
  txReceipt,
  eventName,
  attrName,
  transformation = IDENTITY_FUNCTION
) =>
  txReceipt.logs
    .filter(l => l.event === eventName)
    .map(l => transformation(l.args[attrName]))[0]

const numberToStr = (n, targetLength) => String(n).padStart(targetLength, "0")

module.exports = {
  getNow,
  extractAttrFromEvent,
  ROLE_ADMIN,
  ROLE_SCREENER,
  ROLE_HEALTH_SERVICE,
  DIAGNOSIS_STATUS_UNEXISTING,
  DIAGNOSIS_STATUS_REGISTERED,
  DIAGNOSIS_STATUS_INVALIDATED,
  DIAGNOSIS_STATUS_VALIDATED,
  DIAGNOSIS_STATUS_PAID,
  MINTED_TOKENS
}
