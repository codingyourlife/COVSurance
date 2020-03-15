pragma solidity ^0.5.5;

import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";

contract TokenFactory {
    event InvestorCoinCreated(address indexed sender, InvestorCoin coin);
    event InsureeCoinCreated(address indexed sender, InsureeCoin coin);

    function createInvestorCoin(
        string memory tokenBaseName,
        uint256 rateInPercent
    ) public returns (InvestorCoin) {
        string memory symbol = "COVInv";
        uint8 decimals = 18;
        InvestorCoin investorCoin = new InvestorCoin(
            tokenBaseName,
            symbol,
            decimals
        );

        investorCoin.setRateInPercent(rateInPercent);

        emit InvestorCoinCreated(msg.sender, investorCoin);

        return investorCoin;
    }

    function createInsureeCoin(
        string memory tokenBaseName,
        address investorCoinAddress
    ) public returns (InsureeCoin) {
        string memory symbol = "COVIns";
        uint8 decimals = 18;
        InvestorCoin investorCoin = InvestorCoin(investorCoinAddress);
        InsureeCoin insureeCoin = new InsureeCoin(
            tokenBaseName,
            symbol,
            decimals
        );

        insureeCoin.setReferenceInvestorCoin(investorCoinAddress);
        investorCoin.setReferenceInsureeCoin(address(insureeCoin));

        uint256 rateInPercent = investorCoin.getRateInPercent();

        insureeCoin.setRateInPercent(rateInPercent);

        emit InsureeCoinCreated(msg.sender, insureeCoin);

        return insureeCoin;
    }
}
