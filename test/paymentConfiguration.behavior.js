// COPYRIGHT: FUNDACIÓN TECNALIA RESEARCH & INNOVATION, 2022.
// Licensed to SIC4CHANGE under the following conditions: non-exclusive, irrevocable, non-transferable, and non-sublicensable.
// This license is effective without end date in the field of traceability of patients at risk of malnutrition.

const { expectRevert, expectEvent } = require("@openzeppelin/test-helpers")
const { addPaymentConfiguration } = require("./helpers")
const { ROLE_ADMIN } = require("./utils")

function shouldManagePayments(admin, screener, ...other) {
  const nonAdminAccounts = [screener, ...other]

  context("payment configuration", function () {
    const INITIAL_PRICE = 123

    // Self documentation for this function
    beforeEach(async function () {
      expect(this).to.have.property("nut4health")
    })

    context("addPaymentConfiguration(uint32)", function () {
      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(account =>
            expectRevert(
              this.nut4health.addPaymentConfiguration(INITIAL_PRICE, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("should successfully create a payment configuration", async function () {
        const { receipt } = await this.nut4health.addPaymentConfiguration(
          INITIAL_PRICE,
          {
            from: admin
          }
        )
        expectEvent(receipt, "PaymentUpdated", {
          // assuming "configurationId" is unknown and unpredictable
          price: String(INITIAL_PRICE)
        })
      })
    })

    context("updatePrice(uint32,uint32)", function () {
      const UPDATED_PRICE = 456

      beforeEach(async function () {
        this.configId = await addPaymentConfiguration(
          this.nut4health,
          admin,
          INITIAL_PRICE
        )
      })

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(account =>
            expectRevert(
              this.nut4health.updatePrice(this.configId, UPDATED_PRICE, {
                from: account
              }),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("reverts if configuration does not exist", async function () {
        await expectRevert(
          this.nut4health.updatePrice(this.configId + 1, UPDATED_PRICE, {
            from: admin
          }),
          "No payment configuration found"
        )
      })

      it("should successfully create a payment configuration", async function () {
        const { receipt } = await this.nut4health.updatePrice(
          this.configId,
          UPDATED_PRICE,
          {
            from: admin
          }
        )
        expectEvent(receipt, "PaymentUpdated")
      })
    })

    context("setScreenerConfiguration(address,uint32)", function () {
      beforeEach(async function () {
        this.configId = await addPaymentConfiguration(
          this.nut4health,
          admin,
          INITIAL_PRICE
        )
      })

      it("reverts if unauthorized role", async function () {
        await Promise.all(
          nonAdminAccounts.map(account =>
            expectRevert(
              this.nut4health.setScreenerConfiguration(
                screener,
                this.configId,
                { from: account }
              ),
              `AccessControl: account ${account.toLowerCase()} is missing role ${ROLE_ADMIN}.`
            )
          )
        )
      })

      it("reverts if configuration does not exist", async function () {
        await expectRevert(
          this.nut4health.updatePrice(this.configId + 1, INITIAL_PRICE, {
            from: admin
          }),
          "No payment configuration found"
        )
      })

      it("should successfully assign a configuration to an screener", async function () {
        this.nut4health.setScreenerConfiguration(screener, this.configId, {
          from: admin
        })
        // TODO check with a get or event?
      })
    })
  })
}

module.exports = {
  shouldManagePayments
}
