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
        //investorDeposits required
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });

        await this.moneyVault.insureeDeposits(insuree1, amount);
        const depositOfInsuree = await this.moneyVault.depositsOfInsuree(
          insuree1
        );

        expect(depositOfInsuree.toString()).to.equal(amount.toString());
      });

      it("totalInvestorDeposits and totalInsureeDeposits", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: "20"
        });
        await this.moneyVault.insureeDeposits(insuree1, "10");

        const totalInvestorDeposits = await this.moneyVault.getTotalInvestorDeposits();
        const totalInsureeDeposits = await this.moneyVault.getTotalInsureeDeposits();
        const totalDeposits = await this.moneyVault.getTotalDeposits();

        expect(totalInvestorDeposits.toString()).to.equal("20");
        expect(totalInsureeDeposits.toString()).to.equal("10");
        expect(totalDeposits.toString()).to.equal("30");
      });
    });

    it("insuree requests more than available", async function() {
      await this.moneyVault.investorDeposits(investor1, {
        value: "10"
      });

      let failed = undefined;
      try {
        await this.moneyVault.insureeDeposits(insuree1, "11");
      } catch (e) {
        failed = e;
      }

      expect(failed).not.to.equal(undefined);
    });

    context("states", function() {
      it("default state is MoneyVaultState.Initial", async function() {
        const currentState = await this.moneyVault.getCurrentState();

        expect(currentState.toString()).to.equal("0");
      });

      it("first investor investment changes state to MoneyVaultState.InvestorFound", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("1");
      });

      it("first insuree investment changes state to MoneyVaultState.InsureeFound", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount);

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("2");
      });
    });
  });
});
