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

const TokenFactory = contract.fromArtifact("TokenFactory");

describe("TokenFactory", function() {
  const [controller, unknown] = accounts;

  context("once deployed", function() {
    beforeEach(async function() {
      this.tokenFactory = await TokenFactory.new();
    });

    context("InvestorCoin", function() {
      it("create InvestorCoin", async function() {
        const investorCoinReceipt = await this.tokenFactory.createInvestorCoin(
          "Cov Investor 05/2020 10%",
          {
            from: unknown
          }
        );

        expectEvent(investorCoinReceipt, "InvestorCoinCreated", {
          sender: unknown
        });
      });
    });

    context("InsureeCoin", function() {
      it("create InsureeCoin", async function() {
        const investorCoinReceipt = await this.tokenFactory.createInsureeCoin(
          "Cov Insuree 05/2020 10%",
          {
            from: unknown
          }
        );

        expectEvent(investorCoinReceipt, "InsureeCoinCreated", {
          sender: unknown
        });
      });
    });
  });
});
