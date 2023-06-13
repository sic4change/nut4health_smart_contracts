// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const { expect } = require("chai")
const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers")
const { registerCentreAndDiagnosis, registerDiagnosis } = require("./helpers")
const {
  ROLE_ADMIN,
  ROLE_SCREENER,
  ROLE_HEALTH_SERVICE,
  DIAGNOSIS_STATUS_UNEXISTING,
  DIAGNOSIS_STATUS_REGISTERED,
  DIAGNOSIS_STATUS_INVALIDATED,
  DIAGNOSIS_STATUS_VALIDATED,
  DIAGNOSIS_STATUS_PAID,
  MINTED_TOKENS
} = require("./utils")

function shouldManageDiagnosis(
  admin,
  screener,
  testedHealthService,
  anotherHealthService,
  tokenHolder,
  ...other
) {
  context("diagnosis management", function () {
    const nonScreenerAccounts = [
      admin,
      testedHealthService,
      anotherHealthService,
      tokenHolder,
      ...other
    ]

    const nonAdminAccounts = [
      screener,
      testedHealthService,
      anotherHealthService,
      tokenHolder,
      ...other
    ]

    const nonHealthServices = [admin, screener, ...other]

    const REWARD = 123
    const BACKEND_ID = "backend_id_654"
    const NON_EXISTING_ID = "non_existing_id_543"
    const HEALTH_CENTRE_ID = "hc_id_890"

    async function prepareDiagnosisRegistration() {
      await registerCentreAndDiagnosis(
        this.nut4health,
        [admin, screener, testedHealthService],
        [REWARD, BACKEND_ID, HEALTH_CENTRE_ID]
      )
    }

    // Self documentation for this function
    beforeEach(async function () {
      expect(this).to.have.property("nut4health")
    })

    context("getDiagnosisDetails(string)", function () {
      it("returns unexisting status if it has not been registered", async function () {
        const status = await this.nut4health.getDiagnosisDetails(
          NON_EXISTING_ID,
          { from: testedHealthService }
        )
        expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_UNEXISTING)
      })
    })

    context("registerDiagnosis(string)", function () {
      beforeEach(async function () {
        await this.nut4health.createHealthCentre(HEALTH_CENTRE_ID, {
          from: admin
        })
      })

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonScreenerAccounts.map(account =>
            expectRevert(
              this.nut4health.registerDiagnosis(BACKEND_ID, HEALTH_CENTRE_ID, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_SCREENER}.`
            )
          )
        )
      })

      it("reverts if an empty ID is used", async function () {
        await expectRevert(
          this.nut4health.registerDiagnosis("", HEALTH_CENTRE_ID, {
            from: screener
          }),
          "An empty string is not a valid id"
        )
        await expectRevert(
          this.nut4health.registerDiagnosis(BACKEND_ID, "", {
            from: screener
          }),
          "An empty string is not a valid id"
        )
      })

      it("reverts if there isn't associated payment configuration", async function () {
        await expectRevert(
          this.nut4health.registerDiagnosis(BACKEND_ID, HEALTH_CENTRE_ID, {
            from: screener
          }),
          "No payment configuration assigned to screener."
        )
      })

      it("reverts if assigned health centre does not exist", async function () {
        await expectRevert(
          this.nut4health.registerDiagnosis(BACKEND_ID, NON_EXISTING_ID, {
            from: screener
          }),
          "Unexisting health centre"
        )
      })

      it("should successfully register a diagnosis", async function () {
        const { receipt } = await registerDiagnosis(
          this.nut4health,
          [admin, screener, testedHealthService],
          [REWARD, BACKEND_ID, HEALTH_CENTRE_ID]
        )

        expectEvent(receipt, "DiagnosisCreated", {
          diagnosisId: BACKEND_ID,
          screener,
          reward: String(REWARD)
        })

        let status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
          from: testedHealthService
        })
        expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_REGISTERED)
      })
    })

    context("invalidateDiagnosis(string)", function () {
      beforeEach(prepareDiagnosisRegistration)

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonHealthServices.map(account =>
            expectRevert(
              this.nut4health.invalidateDiagnosis(BACKEND_ID, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_HEALTH_SERVICE}.`
            )
          )
        )
      })

      it("reverts if an empty ID is used", async function () {
        await expectRevert(
          this.nut4health.invalidateDiagnosis("", {
            from: testedHealthService
          }),
          "An empty string is not a valid id"
        )
      })

      it("reverts if there isn't diagnosis in registered state", async function () {
        await expectRevert(
          this.nut4health.invalidateDiagnosis(NON_EXISTING_ID, {
            from: testedHealthService
          }),
          "Diagnosis must be in 'registered' status"
        )
      })

      it("reverts if health service is not assigned to health centre assigned to diagnosis", async function () {
        await expectRevert(
          this.nut4health.invalidateDiagnosis(BACKEND_ID, {
            from: anotherHealthService
          }),
          "Health service not assigned to diagnosis' health centre"
        )
      })

      it("should successfully validate a diagnosis (without token set)", async function () {
        const { receipt } = await this.nut4health.invalidateDiagnosis(
          BACKEND_ID,
          {
            from: testedHealthService
          }
        )
        expectEvent(receipt, "DiagnosisInvalidated", {
          diagnosisId: BACKEND_ID,
          validator: testedHealthService
        })

        const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
          from: testedHealthService
        })
        expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_INVALIDATED)
      })
    })

    context("validateDiagnosis(string)", function () {
      beforeEach(prepareDiagnosisRegistration)

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonHealthServices.map(account =>
            expectRevert(
              this.nut4health.validateDiagnosis(BACKEND_ID, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_HEALTH_SERVICE}.`
            )
          )
        )
      })

      it("reverts if an empty ID is used", async function () {
        await expectRevert(
          this.nut4health.validateDiagnosis("", {
            from: testedHealthService
          }),
          "An empty string is not a valid id"
        )
      })

      it("reverts if there isn't diagnosis in registered state", async function () {
        await expectRevert(
          this.nut4health.validateDiagnosis(NON_EXISTING_ID, {
            from: testedHealthService
          }),
          "Diagnosis must be in 'registered' status"
        )
      })

      it("reverts if health service is not assigned to health centre assigned to diagnosis", async function () {
        await expectRevert(
          this.nut4health.validateDiagnosis(BACKEND_ID, {
            from: anotherHealthService
          }),
          "Health service not assigned to diagnosis' health centre"
        )
      })

      it("should successfully validate a diagnosis (without token set)", async function () {
        await this.nut4health.assignToHealthCentre(
          testedHealthService,
          HEALTH_CENTRE_ID
        )

        const { receipt } = await this.nut4health.validateDiagnosis(
          BACKEND_ID,
          {
            from: testedHealthService
          }
        )
        expectEvent(receipt, "DiagnosisValidated", {
          diagnosisId: BACKEND_ID,
          validator: testedHealthService
        })

        const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
          from: testedHealthService
        })
        expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_VALIDATED)
      })

      context("when token is set", function () {
        beforeEach(async function () {
          await this.nut4health.setToken(this.erc20.address, tokenHolder, {
            from: admin
          })
        })

        it("should successfully validate a diagnosis but not mark it as paid if token cannot be transferred", async function () {
          const ALLOWANCE = REWARD - 1 // Not enough token allowed

          await this.erc20.approve(this.nut4health.address, ALLOWANCE, {
            from: tokenHolder
          })

          const { receipt } = await this.nut4health.validateDiagnosis(
            BACKEND_ID,
            {
              from: testedHealthService
            }
          )

          expectEvent(receipt, "DiagnosisValidated", {
            diagnosisId: BACKEND_ID,
            validator: testedHealthService
          })

          const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
            from: testedHealthService
          })
          expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_VALIDATED)
        })

        it("should successfully validate and pay diagnosis", async function () {
          const ALLOWANCE = MINTED_TOKENS - 1e6

          await this.erc20.approve(this.nut4health.address, ALLOWANCE, {
            from: tokenHolder
          })

          const { receipt, tx } = await this.nut4health.validateDiagnosis(
            BACKEND_ID,
            {
              from: testedHealthService
            }
          )

          await expectEvent.inTransaction(tx, this.erc20, "Transfer", {
            from: tokenHolder,
            to: screener,
            value: String(REWARD)
          })

          expectEvent(receipt, "DiagnosisValidated", {
            diagnosisId: BACKEND_ID,
            validator: testedHealthService
          })

          const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
            from: testedHealthService
          })
          expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_PAID)
        })
      })
    })

    context("payReward(string)", function () {
      beforeEach(prepareDiagnosisRegistration)

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(account =>
            expectRevert(
              this.nut4health.payReward(BACKEND_ID, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("reverts if an empty ID is used", async function () {
        await expectRevert(
          this.nut4health.payReward("", { from: admin }),
          "An empty string is not a valid id"
        )
      })

      it("reverts if token was not set", async function () {
        const ALLOWANCE = REWARD - 1 // Not enough funds

        // It will be validated but not paid (not enough allowance)
        await this.nut4health.validateDiagnosis(BACKEND_ID, {
          from: testedHealthService
        })

        await this.erc20.approve(this.nut4health.address, ALLOWANCE, {
          from: tokenHolder
        })

        await expectRevert(
          this.nut4health.payReward(BACKEND_ID, { from: admin }),
          "revert" // Thrown by ERC20
        )

        const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
          from: testedHealthService
        })
        expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_VALIDATED)
      })

      context("when token is set", function () {
        beforeEach(async function () {
          await this.nut4health.setToken(this.erc20.address, tokenHolder, {
            from: admin
          })
        })

        it("reverts if no enough funds", async function () {
          const ALLOWANCE = REWARD - 1 // Not enough funds

          // It will be validated but not paid (not enough allowance)
          await this.nut4health.validateDiagnosis(BACKEND_ID, {
            from: testedHealthService
          })

          await this.erc20.approve(this.nut4health.address, ALLOWANCE, {
            from: tokenHolder
          })

          await expectRevert(
            this.nut4health.payReward(BACKEND_ID, {
              from: admin
            }),
            "revert" // Thrown by ERC20
          )

          const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
            from: testedHealthService
          })
          expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_VALIDATED)
        })

        it("should successfully pay an already validated diagnosis", async function () {
          const ALLOWANCE = MINTED_TOKENS - 1e6

          // It will be validated but not paid (not enough allowance)
          await this.nut4health.validateDiagnosis(BACKEND_ID, {
            from: testedHealthService
          })

          await this.erc20.approve(this.nut4health.address, ALLOWANCE, {
            from: tokenHolder
          })

          const { receipt, tx } = await this.nut4health.payReward(BACKEND_ID, {
            from: admin
          })

          await expectEvent.inTransaction(tx, this.erc20, "Transfer", {
            from: tokenHolder,
            to: screener,
            value: String(REWARD)
          })

          expectEvent(receipt, "DiagnosisPaid", { diagnosisId: BACKEND_ID })

          const status = await this.nut4health.getDiagnosisDetails(BACKEND_ID, {
            from: testedHealthService
          })
          expect(status).to.be.bignumber.equal(DIAGNOSIS_STATUS_PAID)

          // Check balances
          expect(await this.erc20.balanceOf(tokenHolder)).to.be.bignumber.equal(
            String(MINTED_TOKENS - REWARD)
          )
          expect(await this.erc20.balanceOf(screener)).to.be.bignumber.equal(
            String(REWARD)
          )
          expect(
            await this.erc20.allowance(tokenHolder, this.nut4health.address)
          ).to.be.bignumber.equal(String(ALLOWANCE - REWARD))
        })
      })
    })
  })
}

module.exports = {
  shouldManageDiagnosis
}
