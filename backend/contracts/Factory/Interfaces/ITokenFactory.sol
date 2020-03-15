pragma solidity ^0.5.5;

interface ITokenFactory {
    function createCoins(
        string calldata tokenNameInvestorCoin,
        string calldata tokenNameInsureeCoin,
        uint256 rateInPercent,
        address moneyVault
    ) external returns (address investorCoin, address insureeCoin);
}
