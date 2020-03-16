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
        address insureeCoin,
        address moneyVault
    );

    //two events because of stack size limit
    event InsuranceCreatedDetails(
        address indexed sender,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin,
        address moneyVault,
        uint8 rateInPercent
    );

    constructor(address moneyVaultFactory, address tokenFactory) public {
        _moneyVaultFactory = IMoneyVaultFactory(moneyVaultFactory);
        _tokenFactory = ITokenFactory(tokenFactory);
    }

    function createInsuranceFor(
        string calldata tokenNameInvestor,
        string calldata tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        uint8 rateInPercent
    ) external returns (address, address) {
        (address investorCoin, address insureeCoin) = _tokenFactory.createCoins(
            tokenNameInvestor,
            tokenNameInsuree
        );

        address moneyVault = _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin,
            rateInPercent
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
            insureeCoin,
            moneyVault
        );

        emit InsuranceCreatedDetails(
            msg.sender,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin,
            moneyVault,
            rateInPercent
        );

        return (address(investorCoin), address(insureeCoin));
    }

}
