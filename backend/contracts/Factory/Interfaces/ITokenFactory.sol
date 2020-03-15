pragma solidity ^0.5.5;

interface ITokenFactory {
    function createCoins(
        string calldata tokenNameInvestorCoin,
        string calldata tokenNameInsureeCoin
    ) external returns (address investorCoin, address insureeCoin);
}
