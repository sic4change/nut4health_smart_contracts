// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

/**
 * Helper functions which call to a series of common transactions and
 * provide an output reading the events they throw.
 *
 * This functions provide modularization since they appear in many places.
 */

const { extractAttrFromEvent } = require("./utils")

const toNumber = n => Number(n)

const addPaymentConfiguration = async (nut4health, admin, reward) => {
  const { receipt } = await nut4health.addPaymentConfiguration(reward, {
    from: admin
  })
  return extractAttrFromEvent(
    receipt,
    "PaymentUpdated",
    "configurationId",
    toNumber
  )
}

const registerCentreAndDiagnosis = async (nut4health, accounts, constants) => {
  const [admin] = accounts
  const [, , healthCentreId] = constants

  await nut4health.createHealthCentre(healthCentreId, { from: admin })

  return registerDiagnosis(nut4health, accounts, constants)
}

const registerDiagnosis = async (nut4health, accounts, constants) => {
  const [admin, screener, healthService] = accounts
  const [reward, diagnosisId, healthCentreId] = constants

  const configId = await addPaymentConfiguration(nut4health, admin, reward)

  await nut4health.assignToHealthCentre(healthService, healthCentreId)

  await nut4health.setScreenerConfiguration(screener, configId, {
    from: admin
  })

  // Used for asserts in one test
  return await nut4health.registerDiagnosis(diagnosisId, healthCentreId, {
    from: screener
  })
}

module.exports = {
  addPaymentConfiguration,
  registerCentreAndDiagnosis,
  registerDiagnosis
}
