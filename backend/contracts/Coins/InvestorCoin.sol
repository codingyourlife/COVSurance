pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./Interfaces/IInvestorCoin.sol";
import "./Interfaces/ITransferableOwnership.sol";
import "../MoneyVault/Interfaces/IMoneyVaultInvestor.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "./Interfaces/IMintable.sol";

contract InvestorCoin is
    IInvestorCoin,
    ITransferableOwnership,
    IMintable,
    ERC20Mintable,
    ERC20Detailed,
    Ownable
{
    constructor(string memory name, string memory symbol, uint8 decimals)
        public
        ERC20Detailed(name, symbol, decimals)
    {}

    uint256 private _rateInPercent;
    IERC20 private _insureeCoin;
    IMoneyVaultInvestor private _moneyVault;

    function getRateInPercent() external view returns (uint256) {
        return _rateInPercent;
    }

    function getInsureeCoin() external view returns (IERC20) {
        return _insureeCoin;
    }

    function setReferenceInsureeCoin(address insureeCoin) public onlyOwner {
        _insureeCoin = IERC20(insureeCoin);
    }

    function setRateInPercent(uint256 rateInPercent) external onlyOwner {
        // require(address(_insureeCoin) != address(0), "no ref insureeCoin");
        _rateInPercent = rateInPercent;
    }
}
