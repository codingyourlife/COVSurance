pragma solidity ^0.5.5;

interface IInsuranceFactory {
    function createInsuranceFor(
        string calldata tokenBaseNameInvstor,
        string calldata tokenBaseNameInsuree,
        uint256 rateInPercent,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external returns (address investorCoin, address insureeCoin);
}
