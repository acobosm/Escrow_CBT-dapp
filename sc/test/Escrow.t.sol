// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Escrow.sol";
import "./MockERC20.sol";

contract EscrowTest is Test {
    Escrow public escrow;
    MockERC20 public tokenA;
    MockERC20 public tokenB;

    address public owner = address(1);
    address public userA = address(2);
    address public userB = address(3);
    address public stranger = address(4);

    function setUp() public {
        vm.startPrank(owner);
        escrow = new Escrow();

        tokenA = new MockERC20("Token A", "TKA");
        tokenB = new MockERC20("Token B", "TKB");

        tokenA.mint(userA, 1000 ether);
        tokenB.mint(userB, 1000 ether);

        escrow.addToken(address(tokenA));
        escrow.addToken(address(tokenB));
        vm.stopPrank();
    }

    function test_AddToken() public {
        vm.prank(owner);
        escrow.addToken(address(0x123));
        assertTrue(escrow.isTokenAllowed(address(0x123)));
    }

    function test_CreateOperation() public {
        vm.startPrank(userA);
        tokenA.approve(address(escrow), 100 ether);
        escrow.createOperation(
            address(tokenA),
            address(tokenB),
            100 ether,
            200 ether
        );

        // Correct struct unpacking: id, creator, tokenA, tokenB, amountA...
        (
            uint256 id,
            address creator,
            address tA,
            address tB,
            uint256 amtA,
            ,
            ,
            ,

        ) = escrow.operations(0);

        assertEq(id, 0);
        assertEq(creator, userA);
        assertEq(tA, address(tokenA));
        assertEq(tB, address(tokenB));
        assertEq(amtA, 100 ether);
        vm.stopPrank();
    }

    function test_CompleteOperation() public {
        // Setup operation
        vm.startPrank(userA);
        tokenA.approve(address(escrow), 100 ether);
        escrow.createOperation(
            address(tokenA),
            address(tokenB),
            100 ether,
            200 ether
        );
        vm.stopPrank();

        // Complete it
        vm.startPrank(userB);
        tokenB.approve(address(escrow), 200 ether);
        escrow.completeOperation(0);

        (, , , , , , , bool completed, ) = escrow.operations(0);
        assertTrue(completed);
        assertEq(tokenA.balanceOf(userB), 100 ether); // UserB got TokenA
        assertEq(tokenB.balanceOf(userA), 200 ether); // UserA got TokenB
        vm.stopPrank();
    }

    function test_Revert_AddToken_NonOwner() public {
        vm.prank(stranger);
        vm.expectRevert(
            abi.encodeWithSelector(
                Ownable.OwnableUnauthorizedAccount.selector,
                stranger
            )
        );
        escrow.addToken(address(0x456));
    }

    function test_Revert_CompleteOwnOperation() public {
        vm.startPrank(userA);
        tokenA.approve(address(escrow), 100 ether);
        escrow.createOperation(
            address(tokenA),
            address(tokenB),
            100 ether,
            200 ether
        );

        // UserA tries to complete their own operation
        tokenB.mint(userA, 200 ether);
        tokenB.approve(address(escrow), 200 ether);

        vm.expectRevert("Creator cannot complete own operation");
        escrow.completeOperation(0);
        vm.stopPrank();
    }

    function test_CancelOperation() public {
        vm.startPrank(userA);
        tokenA.approve(address(escrow), 100 ether);
        escrow.createOperation(
            address(tokenA),
            address(tokenB),
            100 ether,
            200 ether
        );

        uint256 balanceBefore = tokenA.balanceOf(userA);
        escrow.cancelOperation(0);

        (, , , , , , , , bool cancelled) = escrow.operations(0);
        assertTrue(cancelled);
        assertEq(tokenA.balanceOf(userA), balanceBefore + 100 ether); // Refunded
        vm.stopPrank();
    }

    function test_Revert_CancelNonOwnedOperation() public {
        vm.startPrank(userA);
        tokenA.approve(address(escrow), 100 ether);
        escrow.createOperation(
            address(tokenA),
            address(tokenB),
            100 ether,
            200 ether
        );
        vm.stopPrank();

        vm.prank(userB);
        vm.expectRevert("Only creator can cancel");
        escrow.cancelOperation(0);
    }
}
