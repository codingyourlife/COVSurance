pragma solidity ^0.5.5;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Secondary.sol";
import "@openzeppelin/contracts/utils/Address.sol";

// based on: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/payment/escrow/Escrow.sol
contract MoneyVault is Secondary {
    using SafeMath for uint256;
    using Address for address;

    event DepositedByInvestor(address indexed payee, uint256 amount);
    event DepositedByInsuree(address indexed payee, uint256 amount);
    event WithdrawnByInvestor(address indexed payee, uint256 amount);

    uint256 private _totalInvestorDeposits;
    uint256 private _totalInsureeDeposits;
    uint256 private _totalDeposits;

    mapping(address => uint256) private _investorDeposits;
    mapping(address => uint256) private _insureeDeposits;

    function depositsOfInvestor(address payee) public view returns (uint256) {
        return _investorDeposits[payee];
    }

    function depositsOfInsuree(address payee) public view returns (uint256) {
        return _insureeDeposits[payee];
    }

    function getTotalInvestorDeposits() public view returns (uint256) {
        return _totalInvestorDeposits;
    }

    function getTotalInsureeDeposits() public view returns (uint256) {
        return _totalInsureeDeposits;
    }

    function getTotalDeposits() public view returns (uint256) {
        return _totalDeposits;
    }

    /**
     * @dev Stores the sent amount as credit to be withdrawn.
     * @param payee The destination address of the funds.
     */
    function investorDeposits(address payee) public payable onlyPrimary {
        uint256 amount = msg.value;
        _investorDeposits[payee] = _investorDeposits[payee].add(amount);
        _totalInvestorDeposits = _totalInvestorDeposits.add(amount);
        _totalDeposits = _totalDeposits.add(amount);

        emit DepositedByInvestor(payee, amount);
    }

    function insureeDeposits(address payee, uint256 amount) public onlyPrimary {
        _insureeDeposits[payee] = _insureeDeposits[payee].add(amount);
        _totalInsureeDeposits = _totalInsureeDeposits.add(amount);
        _totalDeposits = _totalDeposits.add(amount);

        emit DepositedByInsuree(payee, amount);
    }

    // /**
    //  * @dev Withdraw accumulated balance for a payee, forwarding 2300 gas (a
    //  * Solidity `transfer`).
    //  *
    //  * NOTE: This function has been deprecated, use {withdrawWithGas} instead.
    //  * Calling contracts with fixed-gas limits is an anti-pattern and may break
    //  * contract interactions in network upgrades (hardforks).
    //  * https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more.]
    //  *
    //  * @param payee The address whose funds will be withdrawn and transferred to.
    //  */
    // function withdraw(address payable payee) public onlyPrimary {
    //     uint256 payment = _investorDeposits[payee];

    //     _investorDeposits[payee] = 0;

    //     payee.transfer(payment);

    //     emit WithdrawnByInvestor(payee, payment);
    // }

}
