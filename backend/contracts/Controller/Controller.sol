pragma solidity ^0.5.5;

import "../Factory/Interfaces/IInsuranceFactory.sol";

contract Controller {
    IInsuranceFactory _insuranceFactory;
    string _tokenNameInvestor;
    string _tokenNameInsuree;
    uint256 _rateInPercent;

    event InsuranceCreated(
        address indexed sender,
        string tokenNameInvestor,
        string tokenNameInsuree,
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
        string memory tokenNameInvestor,
        string memory tokenNameInsuree,
        uint256 rateInPercent
    ) public {
        _insuranceFactory = insuranceFactory;
        _tokenNameInvestor = tokenNameInvestor;
        _tokenNameInsuree = tokenNameInsuree;
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
            _tokenNameInvestor,
            _tokenNameInsuree,
            _rateInPercent,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        emit InsuranceCreated(
            msg.sender,
            _tokenNameInvestor,
            _tokenNameInsuree,
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
