pragma solidity ^0.5.5;

import "../Controller/Controller.sol";

contract ControllerFactory {
    event ControllerCreated(
        address indexed sender,
        string tokenBaseNameInvstor,
        string tokenBaseNameInsuree,
        uint256 rateInPercent,
        Controller controller,
        IInsuranceFactory insuranceFactory
    );

    function createController(
        IInsuranceFactory insuranceFactory,
        string memory tokenBaseNameInvstor,
        string memory tokenBaseNameInsuree,
        uint256 rateInPercent
    ) public {
        Controller controller = new Controller(
            insuranceFactory,
            tokenBaseNameInvstor,
            tokenBaseNameInsuree,
            rateInPercent
        );

        emit ControllerCreated(
            msg.sender,
            tokenBaseNameInvstor,
            tokenBaseNameInsuree,
            rateInPercent,
            controller,
            insuranceFactory
        );
    }
}
