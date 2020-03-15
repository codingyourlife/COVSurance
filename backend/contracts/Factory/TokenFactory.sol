pragma solidity ^0.5.5;

import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";

contract TokenFactory {
    event InvestorCoinCreated(address indexed sender, InvestorCoin coin);
    event InsureeCoinCreated(address indexed sender, InsureeCoin coin);

    function createCoins(
        string memory tokenNameInvestorCoin,
        string memory tokenNameInsureeCoin,
        uint256 rateInPercent,
        address moneyVault
    ) public returns (InvestorCoin, InsureeCoin) {
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

        return (investorCoin, insureeCoin);

    }
}
