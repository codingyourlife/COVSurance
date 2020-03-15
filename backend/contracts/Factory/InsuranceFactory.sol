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
        string tokenBaseNameInvstor,
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
        string calldata tokenBaseNameInvstor,
        string calldata tokenBaseNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external returns (address, address) {
        _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        InvestorCoin investorCoin = _tokenFactory.createInvestorCoin(
            tokenBaseNameInvstor
        );

        InsureeCoin insureeCoin = _tokenFactory.createInsureeCoin(
            tokenBaseNameInsuree,
            address(investorCoin)
        );

        emit InsuranceCreated(
            msg.sender,
            tokenBaseNameInvstor,
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
