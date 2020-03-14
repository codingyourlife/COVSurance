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

        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        const depositOfInsuree = await this.moneyVault.depositsOfInsuree(
          insuree1
        );

        expect(depositOfInsuree.toString()).to.equal(amount.toString());
      });

      it("insuree factor", async function() {
        //investorDeposits required
        await this.moneyVault.investorDeposits(investor1, {
          value: "20"
        });

        await this.moneyVault.insureeDeposits(insuree1, "10", "2");
        const depositOfInsuree = await this.moneyVault.depositsOfInsuree(
          insuree1
        );

        expect(depositOfInsuree.toString()).to.equal((10 * 2).toString()); //10*2
      });

      it("totalInvestorDeposits and totalInsureeDeposits", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: "20"
        });
        await this.moneyVault.insureeDeposits(insuree1, "10", "1");

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

      await expectRevert(
        this.moneyVault.insureeDeposits(insuree1, "11", "1"),
        "invstor amount too low"
      );
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
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("2");
      });

      it("setActive as intended", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("3");
      });

      it("closeCase(insuredCaseHappened=true) as intended", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("4");
      });

      it("closeCase(insuredCaseHappened=false) as intended", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("5");
      });
    });
  });
});
