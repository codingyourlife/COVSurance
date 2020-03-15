pragma solidity ^0.5.5;

import "../MoneyVault/MoneyVault.sol";
import "./Interfaces/IMoneyVaultFactory.sol";

contract MoneyVaultFactory is IMoneyVaultFactory {
    event MoneyVaultCreated(address indexed sender, MoneyVault vault);

    function createMoneyVault(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd
    ) public returns (address) {
        MoneyVault moneyVault = new MoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd
        );

        moneyVault.transferPrimary(msg.sender);

        emit MoneyVaultCreated(msg.sender, moneyVault);

        return address(moneyVault);
    }
}
