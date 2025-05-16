// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {LoanManager} from "../src/LoanManager.sol";

contract DeployLoan is Script {
    function run() external {
        // Requer variáveis de ambiente: SEPOLIA_RPC_URL e PRIVATE_KEY
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        LoanManager loanManager = new LoanManager();

        console.log("LoanManager deployed at:", address(loanManager));

        vm.stopBroadcast();
    }
}