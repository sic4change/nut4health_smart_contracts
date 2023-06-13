// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const Nut4Health = artifacts.require("Nut4Health.sol")
const ERC20 = artifacts.require("SampleToken.sol")

const { shouldManageHealthCentres } = require("./healthCentre.behavior")
const { shouldManagePayments } = require("./paymentConfiguration.behavior")
const { shouldManageDiagnosis } = require("./diagnosis.behavior")

const {
  ROLE_ADMIN,
  ROLE_SCREENER,
  ROLE_HEALTH_SERVICE,
  MINTED_TOKENS
} = require("./utils")

contract(
  "Nut4Health",
  function ([
    deployer,
    admin,
    screener,
    healthService1,
    healthService2,
    tokenDeployer,
    tokenHolder,
    ...accounts
  ]) {
    beforeEach(async function () {
      this.nut4health = await Nut4Health.new({ from: deployer })

      // Deployer is already an admin, but we create a new one anyway
      await this.nut4health.grantRole(ROLE_ADMIN, admin, {
        from: deployer
      })

      await this.nut4health.grantRole(ROLE_SCREENER, screener, {
        from: deployer
      })

      await this.nut4health.grantRole(ROLE_HEALTH_SERVICE, healthService1, {
        from: deployer
      })

      await this.nut4health.grantRole(ROLE_HEALTH_SERVICE, healthService2, {
        from: deployer
      })

      this.erc20 = await ERC20.new("Token4Health", "N4H", {
        from: tokenDeployer
      })
      this.erc20.issue(tokenHolder, MINTED_TOKENS, {
        from: tokenDeployer
      })
    })

    shouldManageHealthCentres(
      admin,
      healthService1,
      healthService2,
      screener,
      tokenDeployer,
      tokenHolder,
      ...accounts
    )

    shouldManagePayments(
      admin,
      screener,
      healthService1,
      tokenDeployer,
      tokenHolder,
      healthService2,
      ...accounts
    )

    shouldManageDiagnosis(
      admin,
      screener,
      healthService1,
      healthService2,
      tokenHolder,
      tokenDeployer,
      ...accounts
    )
  }
)
