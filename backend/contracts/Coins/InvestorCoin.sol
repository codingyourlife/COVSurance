pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./Interfaces/IInvestorCoin.sol";

contract InvestorCoin is ERC20, ERC20Detailed, Ownable, IInvestorCoin {
    constructor(string memory name, string memory symbol, uint8 decimals)
        public
        ERC20Detailed(name, symbol, decimals)
    {}

    IERC20 private _insureeCoin;

    function getInsureeCoin() public view returns (IERC20) {
        return _insureeCoin;
    }

    function setReferenceInsureeCoin(address insureeCoin) public onlyOwner {
        _insureeCoin = IERC20(insureeCoin);
    }
}
