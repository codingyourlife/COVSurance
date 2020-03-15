pragma solidity ^0.5.5;

import "../Factory/Interfaces/IInsuranceFactory.sol";

contract Controller {
    IInsuranceFactory _insuranceFactory;
    string _tokenBaseNameInvstor;
    string _tokenBaseNameInsuree;
    uint256 _rateInPercent;

    event InsuranceCreated(
        address indexed sender,
        string tokenBaseNameInvstor,
        string tokenBaseNameInsuree,
        uint256 rateInPercent,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin
    );

    constructor(
        IInsuranceFactory insuranceFactory,
        string memory tokenBaseNameInvstor,
        string memory tokenBaseNameInsuree,
        uint256 rateInPercent
    ) public {
        _insuranceFactory = insuranceFactory;
        _tokenBaseNameInvstor = tokenBaseNameInvstor;
        _tokenBaseNameInsuree = tokenBaseNameInsuree;
        _rateInPercent = rateInPercent;
    }

    function createInsuranceFor(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) public {
        (address investorCoin, address insureeCoin) = _insuranceFactory
            .createInsuranceFor(
            _tokenBaseNameInvstor,
            _tokenBaseNameInsuree,
            _rateInPercent,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        emit InsuranceCreated(
            msg.sender,
            _tokenBaseNameInvstor,
            _tokenBaseNameInsuree,
            _rateInPercent,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin
        );
    }
}
