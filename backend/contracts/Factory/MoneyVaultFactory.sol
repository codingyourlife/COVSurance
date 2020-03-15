pragma solidity ^0.5.5;

import "../MoneyVault/MoneyVault.sol";

contract MoneyVaultFactory {
    event MoneyVaultCreated(address indexed sender, MoneyVault vault);

    function createMoneyVault(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) public returns (MoneyVault) {
        MoneyVault moneyVault = new MoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        emit MoneyVaultCreated(msg.sender, moneyVault);

        return moneyVault;
    }
}
