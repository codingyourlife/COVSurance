pragma solidity ^0.5.5;

import "../Controller/Controller.sol";

contract ControllerFactory {
    event ControllerCreated(
        address indexed sender,
        string tokenBaseNameInvestor,
        string tokenBaseNameInsuree,
        uint256 rateInPercent,
        Controller controller,
        IInsuranceFactory insuranceFactory
    );

    function createController(
        IInsuranceFactory insuranceFactory,
        string memory tokenBaseNameInvestor,
        string memory tokenBaseNameInsuree,
        uint256 rateInPercent
    ) public {
        Controller controller = new Controller(
            insuranceFactory,
            tokenBaseNameInvestor,
            tokenBaseNameInsuree,
            rateInPercent
        );

        emit ControllerCreated(
            msg.sender,
            tokenBaseNameInvestor,
            tokenBaseNameInsuree,
            rateInPercent,
            controller,
            insuranceFactory
        );
    }
}
