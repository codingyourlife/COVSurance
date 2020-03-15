pragma solidity ^0.5.5;

import "../Factory/Interfaces/IInsuranceFactory.sol";

contract Controller {
    IInsuranceFactory _insuranceFactory;
    string _tokenBaseNameInvstor;
    string _tokenBaseNameInsuree;

    event InsuranceCreated(
        address indexed sender,
        string tokenBaseNameInvstor,
        string tokenBaseNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    );

    constructor(
        IInsuranceFactory insuranceFactory,
        string memory tokenBaseNameInvstor,
        string memory tokenBaseNameInsuree
    ) public {
        _insuranceFactory = insuranceFactory;
        _tokenBaseNameInvstor = tokenBaseNameInvstor;
        _tokenBaseNameInsuree = tokenBaseNameInsuree;
    }

    function createInsuranceFor(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) public {
        _insuranceFactory.createInsuranceFor(
            _tokenBaseNameInvstor,
            _tokenBaseNameInsuree,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        emit InsuranceCreated(
            msg.sender,
            _tokenBaseNameInvstor,
            _tokenBaseNameInsuree,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );
    }
}
