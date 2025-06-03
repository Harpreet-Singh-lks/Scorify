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


BALANCE=$(cast call 0x48946439c930845eaB91585fb1D4521Bc269c50b "balanceOf(address)" 0xD3Bdf899798dcC3E1c1b47f2E3C0b009B5225548 --rpc-url sepolia)
