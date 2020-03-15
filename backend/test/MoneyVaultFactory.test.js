const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  balance,
  constants,
  ether,
  expectEvent,
  expectRevert,
  time
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const zero_address = "0x0000000000000000000000000000000000000000";

const MoneyVaultFactory = contract.fromArtifact("MoneyVaultFactory");

describe("MoneyVaultFactory", function() {
  const [controller, unknown] = accounts;

  context("once deployed", function() {
    beforeEach(async function() {
      this.moneyVaultFactory = await MoneyVaultFactory.new();
    });

    context("deploy MoneyVaultFactory", function() {
      it("createMoneyVault", async function() {
        const moneyVaultReceipt = await this.moneyVaultFactory.createMoneyVault(
          "0",
          "1",
          "2",
          "3",
          { from: unknown }
        );

        expectEvent(moneyVaultReceipt, "MoneyVaultCreated", {
          sender: unknown
        });
      });
    });
  });
});
