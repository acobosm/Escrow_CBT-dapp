// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/Escrow.sol";
import "../test/MockERC20.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envOr(
            "PRIVATE_KEY",
            uint256(
                0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
            )
        );

        vm.startBroadcast(deployerPrivateKey);

        // Deploy Escrow
        Escrow escrow = new Escrow();
        console.log("Escrow deployed at:", address(escrow));

        // Deploy Mock Tokens
        MockERC20 tokenA = new MockERC20("Token A", "TKA");
        MockERC20 tokenB = new MockERC20("Token B", "TKB");
        console.log("TokenA deployed at:", address(tokenA));
        console.log("TokenB deployed at:", address(tokenB));

        // Authorize tokens in Escrow
        escrow.addToken(address(tokenA));
        escrow.addToken(address(tokenB));
        console.log("Tokens authorized in Escrow");

        // Mint some tokens to standard Anvil addresses for testing
        // Account 1 (User A): 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
        // Account 2 (User B): 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
        tokenA.mint(0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 1000 ether);
        tokenB.mint(0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC, 1000 ether);

        vm.stopBroadcast();
    }
}
