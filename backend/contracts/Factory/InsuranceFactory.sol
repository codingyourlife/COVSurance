pragma solidity ^0.5.5;

import "./MoneyVaultFactory.sol";
import "./TokenFactory.sol";
import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";
import "./Interfaces/IInsuranceFactory.sol";

contract InsuranceFactory is IInsuranceFactory {
    IMoneyVaultFactory _moneyVaultFactory;
    TokenFactory _tokenFactory;

    event InsuranceCreated(
        address indexed sender,
        string tokenNameInvestor,
        string tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        InvestorCoin investorCoin,
        InsureeCoin insureeCoin
    );

    constructor(IMoneyVaultFactory moneyVaultFactory) public {
        _moneyVaultFactory = moneyVaultFactory;
        _tokenFactory = new TokenFactory();
    }

    function createInsuranceFor(
        string calldata tokenNameInvestor,
        string calldata tokenNameInsuree,
        uint256 rateInPercent,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external returns (address, address) {
        address moneyVault = _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        (InvestorCoin investorCoin, InsureeCoin insureeCoin) = _tokenFactory
            .createCoins(
            tokenNameInvestor,
            tokenNameInsuree,
            rateInPercent,
            moneyVault
        );

        emit InsuranceCreated(
            msg.sender,
            tokenNameInvestor,
            tokenNameInsuree,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin
        );

        return (address(investorCoin), address(insureeCoin));
    }

}
