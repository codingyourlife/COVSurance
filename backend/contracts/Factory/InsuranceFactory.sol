pragma solidity ^0.5.5;

import "./MoneyVaultFactory.sol";
import "./TokenFactory.sol";
import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";
import "./Interfaces/IInsuranceFactory.sol";

contract InsuranceFactory is IInsuranceFactory {
    MoneyVaultFactory _moneyVaultFactory;
    TokenFactory _tokenFactory;

    event InsuranceCreated(
        address indexed sender,
        string tokenBaseNameInvestor,
        string tokenBaseNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        InvestorCoin investorCoin,
        InsureeCoin insureeCoin
    );

    constructor() public {
        _moneyVaultFactory = new MoneyVaultFactory();
        _tokenFactory = new TokenFactory();
    }

    function createInsuranceFor(
        string calldata tokenBaseNameInvestor,
        string calldata tokenBaseNameInsuree,
        uint256 rateInPercent,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external returns (address, address) {
        MoneyVault moneyVault = _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        (InvestorCoin investorCoin, InsureeCoin insureeCoin) = _tokenFactory
            .createCoins(
            tokenBaseNameInvestor,
            tokenBaseNameInsuree,
            rateInPercent,
            address(moneyVault)
        );

        emit InsuranceCreated(
            msg.sender,
            tokenBaseNameInvestor,
            tokenBaseNameInsuree,
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
