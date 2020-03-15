pragma solidity ^0.5.5;

contract IInsuranceFactory {
    function createInsuranceFor(
        string calldata tokenBaseNameInvstor,
        string calldata tokenBaseNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external;
}
