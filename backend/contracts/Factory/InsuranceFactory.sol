pragma solidity ^0.5.5;

import "./MoneyVaultFactory.sol";
import "./Interfaces/ITokenFactory.sol";
import "./Interfaces/IInsuranceFactory.sol";
import "../Coins/Interfaces/ITransferableOwnership.sol";
import "../Coins/Interfaces/IMintable.sol";

contract InsuranceFactory is IInsuranceFactory {
    IMoneyVaultFactory _moneyVaultFactory;
    ITokenFactory _tokenFactory;

    event InsuranceCreated(
        address indexed sender,
        string tokenNameInvestor,
        string tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin
    );

    constructor(
        IMoneyVaultFactory moneyVaultFactory,
        ITokenFactory tokenFactory
    ) public {
        _moneyVaultFactory = moneyVaultFactory;
        _tokenFactory = tokenFactory;
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
        (address investorCoin, address insureeCoin) = _tokenFactory.createCoins(
            tokenNameInvestor,
            tokenNameInsuree,
            rateInPercent
        );

        address moneyVault = _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin
        );

        ITransferableOwnership(investorCoin).transferOwnership(moneyVault);
        ITransferableOwnership(insureeCoin).transferOwnership(moneyVault);
        IMintable(investorCoin).addMinter(moneyVault);
        IMintable(insureeCoin).addMinter(moneyVault);

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
