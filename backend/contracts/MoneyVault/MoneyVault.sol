pragma solidity ^0.5.5;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Secondary.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "./Interfaces/IMoneyVaultInvestor.sol";
import "./Interfaces/ITransferablePrimary.sol";
import "../Coins/Interfaces/IMintable.sol";

// based on: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/payment/escrow/Escrow.sol
contract MoneyVault is IMoneyVaultInvestor, ITransferablePrimary, Secondary {
    using SafeMath for uint256;
    using Address for address;

    constructor(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin,
        uint8 rateInPercent
    ) public {
        _insurancePeriodStart = insurancePeriodStart;
        _insurancePeriodEnd = insurancePeriodEnd;
        _signaturePeriodStart = signaturePeriodStart;
        _signaturePeriodEnd = signaturePeriodEnd;
        _investorCoin = IMintable(investorCoin);
        _insureeCoin = IMintable(insureeCoin);
        _rateInPercent = rateInPercent;
    }

    event DepositedByInvestor(address indexed payee, uint256 amount);
    event DepositedByInsuree(address indexed payee, uint256 amount);
    event WithdrawnByInvestor(address indexed payee, uint256 amount);
    event StateChangedToInvestorFound(address indexed payee, uint256 amount);
    event StateChangedToInsureeFound(address indexed payee, uint256 amount);
    event StateChangedToActive(address indexed caller);
    event StateChangedToActiveInsureeBenefits(address indexed caller);
    event StateChangedToActiveInvestorBenefits(address indexed caller);
    event StateChangedToNoInsureeFound(address indexed caller);

    enum MoneyVaultState {
        Initial,
        InvestorFound,
        InsureeFound,
        Active,
        ActiveInsureeBenefits,
        ActiveInvestorBenefits,
        NoInsureeFound
    }

    MoneyVaultState private currentState;

    uint256 private _totalInvestorDeposits;
    uint256 private _totalInsureeDeposits;
    uint256 private _totalDeposits;

    uint256 private _insurancePeriodStart;
    uint256 private _insurancePeriodEnd;

    uint256 private _signaturePeriodStart;
    uint256 private _signaturePeriodEnd;

    IMintable private _investorCoin;
    IMintable private _insureeCoin;

    uint8 private _rateInPercent;

    mapping(address => uint256) private _investorDeposits;
    mapping(address => uint256) private _insureeDeposits;

    function getCurrentState() public view returns (MoneyVaultState) {
        return currentState;
    }

    function depositsOfInvestor(address payee) external view returns (uint256) {
        return _investorDeposits[payee];
    }

    function depositsOfInsuree(address payee) public view returns (uint256) {
        return _insureeDeposits[payee];
    }

    function getTotalInvestorDeposits() external view returns (uint256) {
        return _totalInvestorDeposits;
    }

    function getTotalInsureeDeposits() public view returns (uint256) {
        return _totalInsureeDeposits;
    }

    function getTotalDeposits() external view returns (uint256) {
        return _totalDeposits;
    }

    /**
     * @dev Stores the sent amount as credit to be withdrawn.
     * @param payee The destination address of the funds.
     */
    function investorDeposits(address payee) external payable onlyPrimary {
        require(
            currentState == MoneyVaultState.Initial ||
                currentState == MoneyVaultState.InvestorFound ||
                currentState == MoneyVaultState.InsureeFound,
            "wrong state for investment"
        );
        require(_signaturePeriodStart <= now, "too early");
        require(_signaturePeriodEnd >= now, "too late");
        require(address(_investorCoin) != address(0), "no investorCoin");

        _investorDeposits[payee] = _investorDeposits[payee].add(msg.value);
        _totalInvestorDeposits = _totalInvestorDeposits.add(msg.value);
        _totalDeposits = _totalDeposits.add(msg.value);

        _investorCoin.mint(payee, msg.value.mul(1000)); //TODO: mul1000 is just for testnet

        emit DepositedByInvestor(payee, msg.value);

        if (currentState == MoneyVaultState.Initial) {
            currentState = MoneyVaultState.InvestorFound;

            emit StateChangedToInvestorFound(payee, msg.value);
        }
    }

    function insureeDeposits(address payee) external payable onlyPrimary {
        require(
            currentState == MoneyVaultState.InvestorFound ||
                currentState == MoneyVaultState.InsureeFound,
            "wrong state for investment"
        );
        require(_signaturePeriodStart <= now, "too early");
        require(_signaturePeriodEnd >= now, "too late");
        require(address(_insureeCoin) != address(0), "no insureeCoin");

        require(
            _totalInvestorDeposits >= _totalInsureeDeposits.add(msg.value),
            "investor amount too low"
        );

        _insureeDeposits[payee] = _insureeDeposits[payee].add(msg.value);
        _totalInsureeDeposits = _totalInsureeDeposits.add(msg.value);
        _totalDeposits = _totalDeposits.add(msg.value);

        _insureeCoin.mint(payee, msg.value.div(_rateInPercent).mul(1000)); //TODO: mul1000 is just for testnet

        emit DepositedByInsuree(payee, msg.value);

        if (currentState == MoneyVaultState.InvestorFound) {
            currentState = MoneyVaultState.InsureeFound;

            emit StateChangedToInsureeFound(payee, msg.value);
        }
    }

    function setActive() public onlyPrimary {
        require(currentState == MoneyVaultState.InsureeFound, "wrong state");
        require(_insurancePeriodStart <= now, "too early");
        // require(_insurancePeriodEnd >= now, "too late"); //not important

        currentState = MoneyVaultState.Active;

        emit StateChangedToActive(msg.sender);
    }

    function setNoInsureeFound() public onlyPrimary {
        require(currentState == MoneyVaultState.InvestorFound, "wrong state");

        currentState = MoneyVaultState.NoInsureeFound;

        emit StateChangedToNoInsureeFound(msg.sender);
    }

    function closeCase(bool insuredCaseHappened) public onlyPrimary {
        require(currentState == MoneyVaultState.Active, "wrong state");

        if (insuredCaseHappened) {
            currentState = MoneyVaultState.ActiveInsureeBenefits;
            emit StateChangedToActiveInsureeBenefits(msg.sender);
        } else {
            currentState = MoneyVaultState.ActiveInvestorBenefits;
            emit StateChangedToActiveInvestorBenefits(msg.sender);
        }
    }

    /**
     * @dev Withdraw accumulated balance for a payee, forwarding 2300 gas (a
     * Solidity `transfer`).
     *
     * NOTE: This function has been deprecated, use {withdrawWithGas} instead.
     * Calling contracts with fixed-gas limits is an anti-pattern and may break
     * contract interactions in network upgrades (hardforks).
     * https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more.]
     *
     * @param payee The address whose funds will be withdrawn and transferred to.
     */
    function claimAsInvestor(address payable payee) public onlyPrimary {
        require(
            currentState == MoneyVaultState.ActiveInvestorBenefits,
            "not ActiveInvestorBenefits"
        );

        uint256 payment = _investorDeposits[payee];

        _investorDeposits[payee] = 0;

        payee.transfer(payment);

        emit WithdrawnByInvestor(payee, payment);
    }

    /**
     * @dev Withdraw accumulated balance for a payee, forwarding 2300 gas (a
     * Solidity `transfer`).
     *
     * NOTE: This function has been deprecated, use {withdrawWithGas} instead.
     * Calling contracts with fixed-gas limits is an anti-pattern and may break
     * contract interactions in network upgrades (hardforks).
     * https://diligence.consensys.net/blog/2019/09/stop-using-soliditys-transfer-now/[Learn more.]
     *
     * @param payee The address whose funds will be withdrawn and transferred to.
     */
    function claimAsInsuree(address payable payee) public onlyPrimary {
        require(
            currentState == MoneyVaultState.ActiveInsureeBenefits,
            "not ActiveInsureeBenefits"
        );

        uint256 payment = _investorDeposits[payee];

        _investorDeposits[payee] = 0;

        payee.transfer(payment);

        emit WithdrawnByInvestor(payee, payment);
    }
}
