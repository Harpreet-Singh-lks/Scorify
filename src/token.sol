// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract LendingToken is ERC20, Ownable {
    mapping(address => bool) public authorizedMinters;
    
    constructor() ERC20("GraphiteLoan token", "gUSD") Ownable(msg.sender) {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }
}
