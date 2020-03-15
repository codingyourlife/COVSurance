pragma solidity ^0.5.5;

import "../Coins/InvestorCoin.sol";
import "../Coins/InsureeCoin.sol";
import "./Interfaces/ITokenFactory.sol";

contract TokenFactory is ITokenFactory {
    event InvestorCoinCreated(address indexed sender, InvestorCoin coin);
    event InsureeCoinCreated(address indexed sender, InsureeCoin coin);

    function createCoins(
        string calldata tokenNameInvestorCoin,
        string calldata tokenNameInsureeCoin
    ) external returns (address, address) {
        InvestorCoin investorCoin = new InvestorCoin(
            tokenNameInvestorCoin,
            "COVInv",
            18
        );

        emit InvestorCoinCreated(msg.sender, investorCoin);

        ///

        InsureeCoin insureeCoin = new InsureeCoin(
            tokenNameInsureeCoin,
            "COVIns",
            18
        );

        insureeCoin.setReferenceInvestorCoin(address(investorCoin));
        investorCoin.setReferenceInsureeCoin(address(insureeCoin));

        investorCoin.transferOwnership(msg.sender);
        insureeCoin.transferOwnership(msg.sender);
        investorCoin.addMinter(msg.sender);
        insureeCoin.addMinter(msg.sender);

        emit InsureeCoinCreated(msg.sender, insureeCoin);

        return (address(investorCoin), address(insureeCoin));

    }
}
