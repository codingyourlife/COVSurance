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

const InsuranceFactory = contract.fromArtifact("InsuranceFactory");
const MoneyVaultFactory = contract.fromArtifact("MoneyVaultFactory");

describe("InsuranceFactory", function() {
  const [controller, investor1, insuree1] = accounts;

  const amount = ether("1");

  context("once deployed", function() {
    beforeEach(async function() {
      const moneyVaultFactory = await MoneyVaultFactory.new();
      this.insuranceFactory = await InsuranceFactory.new(
        moneyVaultFactory.address
      );
    });

    context("deploy", function() {
      it("deploy insurance", async function() {
        const deployReceipt = await this.insuranceFactory.createInsuranceFor(
          "Cov Investor 05/2020 10%",
          "Cov Insuree 05/2020 10%",
          "10",
          "0",
          "1",
          "2",
          "3"
        );

        expectEvent(deployReceipt, "InsuranceCreated");
      });
    });
  });
});
