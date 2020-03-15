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

    // function createInvestorCoin(
    //     string memory tokenBaseName,
    //     uint256 rateInPercent,
    //     address moneyVault
    // ) public returns (InvestorCoin) {
    //     string memory symbol = "COVInv";
    //     uint8 decimals = 18;
    //     InvestorCoin investorCoin = new InvestorCoin(
    //         tokenBaseName,
    //         symbol,
    //         decimals
    //     );

    //     investorCoin.setRateInPercent(rateInPercent);
    //     investorCoin.setMoneyVault(moneyVault);

    //     emit InvestorCoinCreated(msg.sender, investorCoin);

    //     return investorCoin;
    // }

    // function createInsureeCoin(
    //     string memory tokenBaseName,
    //     address investorCoinAddress
    // ) public returns (InsureeCoin) {
    //     string memory symbol = "COVIns";
    //     uint8 decimals = 18;
    //     InvestorCoin investorCoin = InvestorCoin(investorCoinAddress);
    //     InsureeCoin insureeCoin = new InsureeCoin(
    //         tokenBaseName,
    //         symbol,
    //         decimals
    //     );

    //     insureeCoin.setReferenceInvestorCoin(investorCoinAddress);
    //     investorCoin.setReferenceInsureeCoin(address(insureeCoin));

    //     uint256 rateInPercent = investorCoin.getRateInPercent();

    //     insureeCoin.setRateInPercent(rateInPercent);

    //     emit InsureeCoinCreated(msg.sender, insureeCoin);

    //     return insureeCoin;
    // }

}
