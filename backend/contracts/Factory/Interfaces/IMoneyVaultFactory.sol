pragma solidity ^0.5.5;

interface IMoneyVaultFactory {
    function createMoneyVault(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) external returns (address);
}
