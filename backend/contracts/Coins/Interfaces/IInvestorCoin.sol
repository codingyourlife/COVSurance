pragma solidity ^0.5.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IInvestorCoin {
    function getInsureeCoin() external view returns (IERC20 insureeCoin);

    function setReferenceInsureeCoin(address insureeCoin) external;
}
