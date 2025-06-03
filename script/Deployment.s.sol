// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "../src/loan.sol";
import "../lib/forge-std/src/Script.sol";

contract Deployment is Script{
    function run() external {
         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address lendingTokenAddress = vm.envAddress("LENDING_TOKEN_ADDRESS");
        
        vm.startBroadcast(deployerPrivateKey);
        
        Loan loanContract = new Loan(lendingTokenAddress);
        
        console.log("Loan Contract deployed to:", address(loanContract));
        
        vm.stopBroadcast();
    }
}


