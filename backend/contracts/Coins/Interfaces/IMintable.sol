pragma solidity ^0.5.5;

interface IMintable {
    function mint(address account, uint256 amount) external returns (bool);
    function addMinter(address account) external;
}
