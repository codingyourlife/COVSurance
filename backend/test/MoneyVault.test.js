const { accounts, contract } = require("@openzeppelin/test-environment");
const {
  balance,
  constants,
  ether,
  expectEvent,
  expectRevert
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const zero_address = "0x0000000000000000000000000000000000000000";

const MoneyVault = contract.fromArtifact("MoneyVault");

describe("MoneyVault", function() {
  const [controller, investor1, insuree1] = accounts;

  const amount = ether("1");

  context("once deployed", function() {
    beforeEach(async function() {
      this.moneyVault = await MoneyVault.new();
    });

    context("investments", function() {
      it("investorDeposits and investment is parked like in an escrow", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        const depositOfInvestor = await this.moneyVault.depositsOfInvestor(
          investor1
        );

        expect(depositOfInvestor.toString()).to.equal(amount.toString());
      });

      it("insureeDeposits are saved", async function() {
        await this.moneyVault.insureeDeposits(insuree1, amount);
        const depositOfInsuree = await this.moneyVault.depositsOfInsuree(
          insuree1
        );

        expect(depositOfInsuree.toString()).to.equal(amount.toString());
      });

      it("totalInvestorDeposits and totalInsureeDeposits", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: "10"
        });
        await this.moneyVault.insureeDeposits(insuree1, "20");

        const totalInvestorDeposits = await this.moneyVault.getTotalInvestorDeposits();
        const totalInsureeDeposits = await this.moneyVault.getTotalInsureeDeposits();
        const totalDeposits = await this.moneyVault.getTotalDeposits();

        expect(totalInvestorDeposits.toString()).to.equal("10");
        expect(totalInsureeDeposits.toString()).to.equal("20");
        expect(totalDeposits.toString()).to.equal("30");
      });
    });
  });
});
