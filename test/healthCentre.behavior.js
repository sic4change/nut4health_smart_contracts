// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers")
const { ROLE_ADMIN } = require("./utils")

function shouldManageHealthCentres(
  admin,
  testedHealthService,
  anotherHealthService,
  ...other
) {
  const nonAdminAccounts = [testedHealthService, anotherHealthService, ...other]
  const nonHealthServices = [admin, ...other]

  context("health centre management", function () {
    const HEALTH_CENTRE_ID = "HEALTH_123"

    // Self documentation for this function
    beforeEach(async function () {
      expect(this).to.have.property("nut4health")
    })

    context("createHealthCentre(string)", function () {
      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(async account =>
            expectRevert(
              this.nut4health.createHealthCentre(HEALTH_CENTRE_ID, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("reverts if an empty ID is used", async function () {
        await expectRevert(
          this.nut4health.createHealthCentre("", {
            from: admin
          }),
          "An empty string is not a valid id"
        )
      })

      it("should successfully create a health centre", async function () {
        const { receipt } = await this.nut4health.createHealthCentre(
          HEALTH_CENTRE_ID,
          {
            from: admin
          }
        )
        expectEvent(receipt, "HealthCentreCreated")
      })
    })

    context("assignToHealthCentre(address,string)", function () {
      beforeEach(async function () {
        await this.nut4health.createHealthCentre(HEALTH_CENTRE_ID, {
          from: admin
        })
      })

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(account =>
            expectRevert(
              this.nut4health.assignToHealthCentre(
                testedHealthService,
                HEALTH_CENTRE_ID,
                {
                  from: account
                }
              ),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("reverts if an empty health centre id is provided", async function () {
        await expectRevert(
          this.nut4health.assignToHealthCentre(testedHealthService, "", {
            from: admin
          }),
          "An empty string is not a valid id"
        )
      })

      it("reverts if health centre does not exist", async function () {
        await expectRevert(
          this.nut4health.assignToHealthCentre(
            testedHealthService,
            HEALTH_CENTRE_ID + "_NON",
            {
              from: admin
            }
          ),
          "Unexisting health centre"
        )
      })

      it("reverts if account to be assigned is not a health service", async function () {
        await Promise.all(
          nonHealthServices.map(account =>
            expectRevert(
              this.nut4health.assignToHealthCentre(account, HEALTH_CENTRE_ID, {
                from: admin
              }),
              "The assigned account must have a health service role"
            )
          )
        )
      })

      it("should successfully assign health service to health centre", async function () {
        const { receipt } = await this.nut4health.assignToHealthCentre(
          testedHealthService,
          HEALTH_CENTRE_ID,
          {
            from: admin
          }
        )

        expectEvent(receipt, "HealthServiceAssigned", {
          healthService: testedHealthService,
          healthCentreId: HEALTH_CENTRE_ID
        })
      })
    })
  })
}

module.exports = {
  shouldManageHealthCentres
}
