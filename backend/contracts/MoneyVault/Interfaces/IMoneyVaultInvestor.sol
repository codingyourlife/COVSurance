pragma solidity ^0.5.5;

interface IMoneyVaultInvestor {
    function depositsOfInvestor(address payee) external view returns (uint256);
    function getTotalInvestorDeposits() external view returns (uint256);
    function getTotalDeposits() external view returns (uint256);
    function investorDeposits(address payee) external payable;
    function claimAsInvestor(address payable payee) external;
}
