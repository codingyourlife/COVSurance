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

const MoneyVault = contract.fromArtifact("MoneyVault");

describe("MoneyVault", function() {
  const [controller, investor1, insuree1] = accounts;

  const amount = ether("1");

  context("once deployed", function() {
    beforeEach(async function() {
      const insurancePeriodStart = await time.latest(); //already active
      const insurancePeriodEnd = (await time.latest()).add(
        time.duration.days(30)
      ); //1 month

      const signaturePeriodStart = insurancePeriodStart;
      const signaturePeriodEnd = insurancePeriodEnd;

      this.moneyVault = await MoneyVault.new(
        insurancePeriodStart,
        insurancePeriodEnd,
        signaturePeriodStart,
        signaturePeriodEnd
      );
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

      it("investorDeposits too early", async function() {
        const insurancePeriodStart = (await time.latest()).add(
          time.duration.days(30)
        ); //in 5min
        const insurancePeriodEnd = (await time.latest()).add(
          time.duration.days(30)
        ); //1 month

        const signaturePeriodStart = insurancePeriodStart;
        const signaturePeriodEnd = insurancePeriodEnd;

        const tmpMoneyVault = await MoneyVault.new(
          insurancePeriodStart,
          insurancePeriodEnd,
          signaturePeriodStart,
          signaturePeriodEnd
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits(investor1, {
            value: amount
          }),
          "too early"
        );
      });

      it("investorDeposits too late", async function() {
        const insurancePeriodStart = (await time.latest()).sub(
          time.duration.days(35)
        ); //way back
        const insurancePeriodEnd = (await time.latest()).sub(
          time.duration.days(30)
        ); //way back

        const signaturePeriodStart = insurancePeriodStart;
        const signaturePeriodEnd = insurancePeriodEnd;

        const tmpMoneyVault = await MoneyVault.new(
          insurancePeriodStart,
          insurancePeriodEnd,
          signaturePeriodStart,
          signaturePeriodEnd
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits(investor1, {
            value: amount
          }),
          "too late"
        );
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

      it("insureeDeposits too early (fails because not even in state)", async function() {
        const insurancePeriodStart = (await time.latest()).add(
          time.duration.minutes(5)
        ); //in 5min
        const insurancePeriodEnd = (await time.latest()).add(
          time.duration.days(30)
        ); //1 month

        const signaturePeriodStart = insurancePeriodStart;
        const signaturePeriodEnd = insurancePeriodEnd;

        const tmpMoneyVault = await MoneyVault.new(
          insurancePeriodStart,
          insurancePeriodEnd,
          signaturePeriodStart,
          signaturePeriodEnd
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits(investor1, {
            value: amount
          }),
          "too early"
        );

        await expectRevert(
          tmpMoneyVault.insureeDeposits(insuree1, amount, "1"),
          "wrong state for investment."
        );
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

      it("setActive too early", async function() {
        const insurancePeriodStart = (await time.latest()).add(
          time.duration.minutes(5)
        ); //active in 5min
        const insurancePeriodEnd = (await time.latest()).add(
          time.duration.days(30)
        ); //1 month

        const signaturePeriodStart = await time.latest();
        const signaturePeriodEnd = insurancePeriodEnd;

        const tmpMoneyVault = await MoneyVault.new(
          insurancePeriodStart,
          insurancePeriodEnd,
          signaturePeriodStart,
          signaturePeriodEnd
        );

        await tmpMoneyVault.investorDeposits(investor1, {
          value: amount
        });
        await tmpMoneyVault.insureeDeposits(insuree1, amount, "1");
        await expectRevert(tmpMoneyVault.setActive(), "too early");
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

      it("setNoInsureeFound as intended", async function() {
        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.setNoInsureeFound();

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("6");
      });
    });

    context("withdraw", function() {
      it("withdraw as investor as intended if insuredCaseHappened=false", async function() {
        const balanceTracker = await balance.tracker(investor1);

        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        await this.moneyVault.claimAsInvestor(investor1);

        expect(await balanceTracker.delta()).to.be.bignumber.equal(amount);
      });

      it("withdraw as investor if insuredCaseHappened=true should fail", async function() {
        const balanceTracker = await balance.tracker(investor1);

        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        await expectRevert(
          this.moneyVault.claimAsInvestor(investor1),
          "not ActiveInvestorBenefits"
        );
      });

      it("withdraw as insuree as intended if insuredCaseHappened=true", async function() {
        const balanceTracker = await balance.tracker(insuree1);

        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        await this.moneyVault.claimAsInsuree(insuree1);
      });

      it("withdraw as insuree if insuredCaseHappened=false should fail", async function() {
        const balanceTracker = await balance.tracker(insuree1);

        await this.moneyVault.investorDeposits(investor1, {
          value: amount
        });
        await this.moneyVault.insureeDeposits(insuree1, amount, "1");
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        await expectRevert(
          this.moneyVault.claimAsInsuree(insuree1),
          "not ActiveInsureeBenefits"
        );
      });
    });
  });
});
