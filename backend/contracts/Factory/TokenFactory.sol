pragma solidity ^0.5.5;

import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";
import "./Interfaces/ITokenFactory.sol";

contract TokenFactory is ITokenFactory {
    event InvestorCoinCreated(address indexed sender, InvestorCoin coin);
    event InsureeCoinCreated(address indexed sender, InsureeCoin coin);

    function createCoins(
        string calldata tokenNameInvestorCoin,
        string calldata tokenNameInsureeCoin,
        uint256 rateInPercent,
        address moneyVault
    ) external returns (address, address) {
        InvestorCoin investorCoin = new InvestorCoin(
            tokenNameInvestorCoin,
            "COVInv",
            18
        );

        investorCoin.setRateInPercent(rateInPercent);
        investorCoin.setMoneyVault(moneyVault);

        emit InvestorCoinCreated(msg.sender, investorCoin);

        ///

        InsureeCoin insureeCoin = new InsureeCoin(
            tokenNameInsureeCoin,
            "COVIns",
            18
        );

        insureeCoin.setReferenceInvestorCoin(address(investorCoin));
        investorCoin.setReferenceInsureeCoin(address(insureeCoin));

        insureeCoin.setRateInPercent(rateInPercent);

        emit InsureeCoinCreated(msg.sender, insureeCoin);

        return (address(investorCoin), address(insureeCoin));

    }
}
