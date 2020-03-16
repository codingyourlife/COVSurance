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
const InvestorCoin = contract.fromArtifact("InvestorCoin");
const InsureeCoin = contract.fromArtifact("InsureeCoin");

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

      this.investorCoin = await InvestorCoin.new("DEMOInv", "DEMOInv", 18);
      this.insureeCoin = await InsureeCoin.new("DEMOInv", "DEMOInv", 18);

      this.moneyVault = await MoneyVault.new(
        insurancePeriodStart,
        insurancePeriodEnd,
        signaturePeriodStart,
        signaturePeriodEnd,
        this.investorCoin.address,
        this.insureeCoin.address,
        "10"
      );

      await this.investorCoin.addMinter(this.moneyVault.address);
      await this.insureeCoin.addMinter(this.moneyVault.address);
    });

    context("investments", function() {
      it("investorDeposits and investment is parked like in an escrow", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
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
          signaturePeriodEnd,
          zero_address,
          zero_address,
          "10"
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits({
            from: investor1,
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
          signaturePeriodEnd,
          zero_address,
          zero_address,
          "10"
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits({
            from: investor1,
            value: amount
          }),
          "too late"
        );
      });

      it("insureeDeposits are saved", async function() {
        //investorDeposits required
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });

        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
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
          signaturePeriodEnd,
          zero_address,
          zero_address,
          "10"
        );

        await expectRevert(
          tmpMoneyVault.investorDeposits({
            from: investor1,
            value: amount
          }),
          "too early"
        );

        await expectRevert(
          tmpMoneyVault.insureeDeposits({
            from: insuree1,
            value: amount
          }),
          "wrong state for investment."
        );
      });

      it("totalInvestorDeposits and totalInsureeDeposits", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: "20"
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: "10"
        });

        const totalInvestorDeposits = await this.moneyVault.getTotalInvestorDeposits();
        const totalInsureeDeposits = await this.moneyVault.getTotalInsureeDeposits();
        const totalDeposits = await this.moneyVault.getTotalDeposits();

        expect(totalInvestorDeposits.toString()).to.equal("20");
        expect(totalInsureeDeposits.toString()).to.equal("10");
        expect(totalDeposits.toString()).to.equal("30");
      });
    });

    context("thresholds", function() {
      it("insuree requests more than available", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: "10"
        });

        await expectRevert(
          this.moneyVault.insureeDeposits({
            from: insuree1,
            value: amount
          }),
          "investor amount too low"
        );
      });
    });

    context("states", function() {
      it("default state is MoneyVaultState.Initial", async function() {
        const currentState = await this.moneyVault.getCurrentState();

        expect(currentState.toString()).to.equal("0");
      });

      it("first investor investment changes state to MoneyVaultState.InvestorFound", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("1");
      });

      it("first insuree investment changes state to MoneyVaultState.InsureeFound", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("2");
      });

      it("setActive as intended", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
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
          signaturePeriodEnd,
          this.investorCoin.address,
          this.insureeCoin.address,
          "10"
        );

        await this.investorCoin.addMinter(tmpMoneyVault.address);
        await this.insureeCoin.addMinter(tmpMoneyVault.address);

        await tmpMoneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await tmpMoneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await expectRevert(tmpMoneyVault.setActive(), "too early");
      });

      it("closeCase(insuredCaseHappened=true) as intended", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("4");
      });

      it("closeCase(insuredCaseHappened=false) as intended", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        const currentState = await this.moneyVault.getCurrentState();
        expect(currentState.toString()).to.equal("5");
      });

      it("setNoInsureeFound as intended", async function() {
        await this.moneyVault.investorDeposits({
          from: investor1,
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

        await this.moneyVault.investorDeposits({
          value: amount,
          from: investor1,
          gasPrice: 0
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        await this.moneyVault.claimAsInvestor({ from: investor1, gasPrice: 0 });

        expect((await balanceTracker.delta()).toString()).to.be.bignumber.equal(
          "0"
        );
      });

      it("withdraw as investor if insuredCaseHappened=true should fail", async function() {
        const balanceTracker = await balance.tracker(investor1);

        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        await expectRevert(
          this.moneyVault.claimAsInvestor({ from: investor1 }),
          "not ActiveInvestorBenefits"
        );
      });

      it("withdraw as insuree as intended if insuredCaseHappened=true", async function() {
        const balanceTracker = await balance.tracker(insuree1);

        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount,
          gasPrice: 0
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(true);

        await this.moneyVault.claimAsInsuree({ from: insuree1, gasPrice: 0 });

        expect((await balanceTracker.delta()).toString()).to.be.bignumber.equal(
          "0"
        );
      });

      it("withdraw as insuree if insuredCaseHappened=false should fail", async function() {
        const balanceTracker = await balance.tracker(insuree1);

        await this.moneyVault.investorDeposits({
          from: investor1,
          value: amount
        });
        await this.moneyVault.insureeDeposits({
          from: insuree1,
          value: amount
        });
        await this.moneyVault.setActive();
        await this.moneyVault.closeCase(false);

        await expectRevert(
          this.moneyVault.claimAsInsuree({ from: insuree1 }),
          "not ActiveInsureeBenefits"
        );
      });
    });
  });
});
