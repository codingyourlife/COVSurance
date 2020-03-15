pragma solidity ^0.5.5;

import "../Controller/Controller.sol";

contract ControllerFactory {
    event ControllerCreated(
        address indexed sender,
        string tokenNameInvestor,
        string tokenNameInsuree,
        uint8 rateInPercent,
        Controller controller,
        IInsuranceFactory insuranceFactory
    );

    function createController(
        IInsuranceFactory insuranceFactory,
        string memory tokenNameInvestor,
        string memory tokenNameInsuree,
        uint8 rateInPercent
    ) public {
        Controller controller = new Controller(
            insuranceFactory,
            tokenNameInvestor,
            tokenNameInsuree,
            rateInPercent
        );

        emit ControllerCreated(
            msg.sender,
            tokenNameInvestor,
            tokenNameInsuree,
            rateInPercent,
            controller,
            insuranceFactory
        );
    }
}
