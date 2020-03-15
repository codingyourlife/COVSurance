// File: @openzeppelin/contracts/math/SafeMath.sol

pragma solidity ^0.5.0;

/**
 * @dev Wrappers over Solidity's arithmetic operations with added overflow
 * checks.
 *
 * Arithmetic operations in Solidity wrap on overflow. This can easily result
 * in bugs, because programmers usually assume that an overflow raises an
 * error, which is the standard behavior in high level programming languages.
 * `SafeMath` restores this intuition by reverting the transaction when an
 * operation overflows.
 *
 * Using this library instead of the unchecked operations eliminates an entire
 * class of bugs, so it's recommended to use it always.
 */
library SafeMath {
    /**
     * @dev Returns the addition of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `+` operator.
     *
     * Requirements:
     * - Addition cannot overflow.
     */
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");

        return c;
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     */
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        return sub(a, b, "SafeMath: subtraction overflow");
    }

    /**
     * @dev Returns the subtraction of two unsigned integers, reverting with custom message on
     * overflow (when the result is negative).
     *
     * Counterpart to Solidity's `-` operator.
     *
     * Requirements:
     * - Subtraction cannot overflow.
     *
     * _Available since v2.4.0._
     */
    function sub(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        require(b <= a, errorMessage);
        uint256 c = a - b;

        return c;
    }

    /**
     * @dev Returns the multiplication of two unsigned integers, reverting on
     * overflow.
     *
     * Counterpart to Solidity's `*` operator.
     *
     * Requirements:
     * - Multiplication cannot overflow.
     */
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        // Gas optimization: this is cheaper than requiring 'a' not being zero, but the
        // benefit is lost if 'b' is also tested.
        // See: https://github.com/OpenZeppelin/openzeppelin-contracts/pull/522
        if (a == 0) {
            return 0;
        }

        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");

        return c;
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        return div(a, b, "SafeMath: division by zero");
    }

    /**
     * @dev Returns the integer division of two unsigned integers. Reverts with custom message on
     * division by zero. The result is rounded towards zero.
     *
     * Counterpart to Solidity's `/` operator. Note: this function uses a
     * `revert` opcode (which leaves remaining gas untouched) while Solidity
     * uses an invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function div(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        // Solidity only automatically asserts when dividing by 0
        require(b > 0, errorMessage);
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold

        return c;
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     */
    function mod(uint256 a, uint256 b) internal pure returns (uint256) {
        return mod(a, b, "SafeMath: modulo by zero");
    }

    /**
     * @dev Returns the remainder of dividing two unsigned integers. (unsigned integer modulo),
     * Reverts with custom message when dividing by zero.
     *
     * Counterpart to Solidity's `%` operator. This function uses a `revert`
     * opcode (which leaves remaining gas untouched) while Solidity uses an
     * invalid opcode to revert (consuming all remaining gas).
     *
     * Requirements:
     * - The divisor cannot be zero.
     *
     * _Available since v2.4.0._
     */
    function mod(uint256 a, uint256 b, string memory errorMessage)
        internal
        pure
        returns (uint256)
    {
        require(b != 0, errorMessage);
        return a % b;
    }
}

// File: @openzeppelin/contracts/GSN/Context.sol

pragma solidity ^0.5.0;

/*
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with GSN meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
contract Context {
    // Empty internal constructor, to prevent people from mistakenly deploying
    // an instance of this contract, which should be used via inheritance.
    constructor() internal {}
    // solhint-disable-previous-line no-empty-blocks

    function _msgSender() internal view returns (address payable) {
        return msg.sender;
    }

    function _msgData() internal view returns (bytes memory) {
        this; // silence state mutability warning without generating bytecode - see https://github.com/ethereum/solidity/issues/2691
        return msg.data;
    }
}

// File: @openzeppelin/contracts/ownership/Secondary.sol

pragma solidity ^0.5.0;

/**
 * @dev A Secondary contract can only be used by its primary account (the one that created it).
 */
contract Secondary is Context {
    address private _primary;

    /**
     * @dev Emitted when the primary contract changes.
     */
    event PrimaryTransferred(address recipient);

    /**
     * @dev Sets the primary account to the one that is creating the Secondary contract.
     */
    constructor() internal {
        address msgSender = _msgSender();
        _primary = msgSender;
        emit PrimaryTransferred(msgSender);
    }

    /**
     * @dev Reverts if called from any account other than the primary.
     */
    modifier onlyPrimary() {
        require(
            _msgSender() == _primary,
            "Secondary: caller is not the primary account"
        );
        _;
    }

    /**
     * @return the address of the primary.
     */
    function primary() public view returns (address) {
        return _primary;
    }

    /**
     * @dev Transfers contract to a new primary.
     * @param recipient The address of new primary.
     */
    function transferPrimary(address recipient) public onlyPrimary {
        require(
            recipient != address(0),
            "Secondary: new primary is the zero address"
        );
        _primary = recipient;
        emit PrimaryTransferred(recipient);
    }
}

// File: @openzeppelin/contracts/utils/Address.sol

/**
 * @dev Collection of functions related to the address type
 */
library Address {
    /**
     * @dev Returns true if `account` is a contract.
     *
     * [IMPORTANT]
     * ====
     * It is unsafe to assume that an address for which this function returns
     * false is an externally-owned account (EOA) and not a contract.
     *
     * Among others, `isContract` will return false for the following 
     * types of addresses:
     *
     *  - an externally-owned account
     *  - a contract in construction
     *  - an address where a contract will be created
     *  - an address where a contract lived, but was destroyed
     * ====
     */
    function isContract(address account) internal view returns (bool) {
        // According to EIP-1052, 0x0 is the value returned for not-yet created accounts
        // and 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470 is returned
        // for accounts without code, i.e. `keccak256('')`
        bytes32 codehash;
        bytes32 accountHash = 0xc5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            codehash := extcodehash(account)
        }
        return (codehash != accountHash && codehash != 0x0);
    }

    /**
     * @dev Converts an `address` into `address payable`. Note that this is
     * simply a type cast: the actual underlying value is not changed.
     *
     * _Available since v2.4.0._
     */
    function toPayable(address account)
        internal
        pure
        returns (address payable)
    {
        return address(uint160(account));
    }

    /**
     * @dev Replacement for Solidity's `transfer`: sends `amount` wei to
     * `recipient`, forwarding all available gas and reverting on errors.
     *
     * https://eips.ethereum.org/EIPS/eip-1884[EIP1884] increases the gas cost
     * of certain opcodes, possibly making contracts go over the 2300 gas limit
     * imposed by `transfer`, making them unable to receive funds via
     * `transfer`. {sendValue} removes this limitation.
     *
     * https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/[Learn more].
     *
     * IMPORTANT: because control is transferred to `recipient`, care must be
     * taken to not create reentrancy vulnerabilities. Consider using
     * {ReentrancyGuard} or the
     * https://solidity.readthedocs.io/en/v0.5.11/security-considerations.html#use-the-checks-effects-interactions-pattern[checks-effects-interactions pattern].
     *
     * _Available since v2.4.0._
     */
    function sendValue(address payable recipient, uint256 amount) internal {
        require(
            address(this).balance >= amount,
            "Address: insufficient balance"
        );

        // solhint-disable-next-line avoid-call-value
        (bool success, ) = recipient.call.value(amount)("");
        require(
            success,
            "Address: unable to send value, recipient may have reverted"
        );
    }
}

// File: contracts/MoneyVault/Interfaces/IMoneyVaultInvestor.sol

interface IMoneyVaultInvestor {
    function depositsOfInvestor(address payee) external view returns (uint256);
    function getTotalInvestorDeposits() external view returns (uint256);
    function getTotalDeposits() external view returns (uint256);
    function investorDeposits(address payee) external payable;
    function claimAsInvestor(address payable payee) external;
}

// File: contracts/Coins/Interfaces/IMintable.sol

interface IMintable {
    function mint(address account, uint256 amount) external returns (bool);
    function addMinter(address account) external;
}

// File: contracts/MoneyVault/MoneyVault.sol

// based on: https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v2.5.0/contracts/payment/escrow/Escrow.sol
contract MoneyVault is IMoneyVaultInvestor, Secondary {
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

        _investorDeposits[payee] = _investorDeposits[payee].add(msg.value);
        _totalInvestorDeposits = _totalInvestorDeposits.add(msg.value);
        _totalDeposits = _totalDeposits.add(msg.value);

        // _investorCoin.mint(payee, msg.value.mul(1000)); //TODO: mul1000 is just for testnet

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

        require(
            _totalInvestorDeposits >= _totalInsureeDeposits.add(msg.value),
            "investor amount too low"
        );

        _insureeDeposits[payee] = _insureeDeposits[payee].add(msg.value);
        _totalInsureeDeposits = _totalInsureeDeposits.add(msg.value);
        _totalDeposits = _totalDeposits.add(msg.value);

        // _insureeCoin.mint(payee, factorizedAmount.mul(1000)); //TODO: mul1000 is just for testnet

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

// File: contracts/Factory/Interfaces/IMoneyVaultFactory.sol

interface IMoneyVaultFactory {
    function createMoneyVault(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin,
        uint8 rateInPercent
    ) external returns (address);
}

// File: contracts/Factory/MoneyVaultFactory.sol

contract MoneyVaultFactory is IMoneyVaultFactory {
    event MoneyVaultCreated(address indexed sender, MoneyVault vault);

    function createMoneyVault(
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin,
        uint8 rateInPercent
    ) public returns (address) {
        MoneyVault moneyVault = new MoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin,
            rateInPercent
        );

        moneyVault.transferPrimary(msg.sender);

        emit MoneyVaultCreated(msg.sender, moneyVault);

        return address(moneyVault);
    }
}

// File: contracts/Factory/Interfaces/ITokenFactory.sol

interface ITokenFactory {
    function createCoins(
        string calldata tokenNameInvestorCoin,
        string calldata tokenNameInsureeCoin
    ) external returns (address investorCoin, address insureeCoin);
}

// File: contracts/Factory/Interfaces/IInsuranceFactory.sol

interface IInsuranceFactory {
    function createInsuranceFor(
        string calldata tokenNameInvestor,
        string calldata tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        uint8 rateInPercent
    ) external returns (address investorCoin, address insureeCoin);
}

// File: contracts/Coins/Interfaces/ITransferableOwnership.sol

interface ITransferableOwnership {
    function transferOwnership(address newOwner) external;
}

// File: contracts/Factory/InsuranceFactory.sol

contract InsuranceFactory is IInsuranceFactory {
    IMoneyVaultFactory _moneyVaultFactory;
    ITokenFactory _tokenFactory;

    event InsuranceCreated(
        address indexed sender,
        string tokenNameInvestor,
        string tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        address investorCoin,
        address insureeCoin
    );

    constructor(address moneyVaultFactory, address tokenFactory) public {
        _moneyVaultFactory = IMoneyVaultFactory(moneyVaultFactory);
        _tokenFactory = ITokenFactory(tokenFactory);
    }

    function createInsuranceFor(
        string calldata tokenNameInvestor,
        string calldata tokenNameInsuree,
        uint256 insurancePeriodStart,
        uint256 insurancePeriodEnd,
        uint256 signaturePeriodStart,
        uint256 signaturePeriodEnd,
        uint8 rateInPercent
    ) external returns (address, address) {
        (address investorCoin, address insureeCoin) = _tokenFactory.createCoins(
            tokenNameInvestor,
            tokenNameInsuree
        );

        address moneyVault = _moneyVaultFactory.createMoneyVault(
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin,
            rateInPercent
        );

        ITransferableOwnership(investorCoin).transferOwnership(moneyVault);
        ITransferableOwnership(insureeCoin).transferOwnership(moneyVault);
        IMintable(investorCoin).addMinter(moneyVault);
        IMintable(insureeCoin).addMinter(moneyVault);

        emit InsuranceCreated(
            msg.sender,
            tokenNameInvestor,
            tokenNameInsuree,
            insurancePeriodStart,
            insurancePeriodEnd,
            signaturePeriodStart,
            signaturePeriodEnd,
            investorCoin,
            insureeCoin
        );

        return (address(investorCoin), address(insureeCoin));
    }

}
