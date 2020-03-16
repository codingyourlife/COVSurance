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
const TokenFactory = contract.fromArtifact("TokenFactory");
const MoneyVault = contract.fromArtifact("MoneyVault");
const InsureeCoin = contract.fromArtifact("InsureeCoin");
const InvestorCoin = contract.fromArtifact("InvestorCoin");

describe("InsuranceFactory", function() {
  const [controller, investor1, insuree1] = accounts;

  const amountInvestor = ether("1");
  const amountInsuree = ether("0.3");

  const signatureEnd = ether("999999999").toString();

  context("once deployed", function() {
    beforeEach(async function() {
      const moneyVaultFactory = await MoneyVaultFactory.new();
      const tokenFactory = await TokenFactory.new();

      this.insuranceFactory = await InsuranceFactory.new(
        moneyVaultFactory.address.toString(),
        tokenFactory.address.toString()
      );
    });

    context("deploy", function() {
      it("deploy insurance", async function() {
        const deployReceipt = await this.insuranceFactory.createInsuranceFor(
          "Cov Investor 05/2020 10%",
          "Cov Insuree 05/2020 10%",
          "0",
          "1",
          "2",
          "3",
          "10"
        );
        expectEvent(deployReceipt, "InsuranceCreated");
        expectEvent(deployReceipt, "InsuranceCreatedDetails");
      });

      it("investor invests in moneyFactory", async function() {
        const deployReceipt = await this.insuranceFactory.createInsuranceFor(
          "Cov Investor 05/2020 10%",
          "Cov Insuree 05/2020 10%",
          "0",
          "1",
          "2",
          signatureEnd,
          "10"
        );

        const moneyVault = deployReceipt.logs[0].args.moneyVault;
        const investorCoin = deployReceipt.logs[0].args.investorCoin;
        const investorCoinContract = await InvestorCoin.at(investorCoin);

        const moneyVaultContract = await MoneyVault.at(moneyVault);
        await moneyVaultContract.investorDeposits({
          from: investor1,
          value: amountInvestor
        });

        const investorCoinTotalSupply = await investorCoinContract.totalSupply();

        expect(investorCoinTotalSupply.toString()).to.equal(
          ether("1000").toString()
        );
      });

      it("insuree invest in moneyFactory", async function() {
        const deployReceipt = await this.insuranceFactory.createInsuranceFor(
          "Cov Investor 05/2020 10%",
          "Cov Insuree 05/2020 10%",
          "0",
          "1",
          "2",
          signatureEnd,
          "30"
        );

        const moneyVault = deployReceipt.logs[0].args.moneyVault;
        const insureeCoin = deployReceipt.logs[0].args.insureeCoin;
        const insureeCoinContract = await InsureeCoin.at(insureeCoin);

        const moneyVaultContract = await MoneyVault.at(moneyVault);

        await moneyVaultContract.investorDeposits({
          from: investor1,
          value: amountInvestor
        });

        await moneyVaultContract.insureeDeposits({
          from: insuree1,
          value: amountInsuree
        });

        const insureeCoinTotalSupply = await insureeCoinContract.totalSupply();

        expect(insureeCoinTotalSupply.toString()).to.equal(
          ether("1000").toString()
        ); //TODO: mul1000 is just for testnet
      });
    });
  });
});
