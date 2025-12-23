// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SupplyChain.sol";

contract DeploySupplyChain is Script {
    function run() external returns (SupplyChain) {
        // Begin recording transactions to be broadcast
        // This will use the account specified via command line private-key or --sender
        vm.startBroadcast();

        // Deploy the contract
        SupplyChain supplyChain = new SupplyChain();

        // Stop recording
        vm.stopBroadcast();

        // Log the address for easy reference
        console.log("SupplyChain deployed at:", address(supplyChain));

        return supplyChain;
    }
}