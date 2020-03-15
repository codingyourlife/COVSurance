pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IInsureeCoin {
    function getInvestorCoin() external view returns (IERC20 investorCoin);

    function setReferenceInvestorCoin(address investorCoin) external;

    function getRateInPercent() external view returns (uint256 rateInPercent);

    function setRateInPercent(uint256 rateInPercent) external;
}
