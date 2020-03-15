pragma solidity ^0.5.5;

import "../Controller/Controller.sol";

contract ControllerFactory {
    event ControllerCreated(
        address indexed sender,
        string tokenBaseNameInvstor,
        string tokenBaseNameInsuree,
        Controller controller,
        IInsuranceFactory insuranceFactory
    );

    function createController(
        IInsuranceFactory insuranceFactory,
        string memory tokenBaseNameInvstor,
        string memory tokenBaseNameInsuree
    ) public {
        Controller controller = new Controller(
            insuranceFactory,
            tokenBaseNameInvstor,
            tokenBaseNameInsuree
        );

        emit ControllerCreated(
            msg.sender,
            tokenBaseNameInvstor,
            tokenBaseNameInsuree,
            controller,
            insuranceFactory
        );
    }
}
