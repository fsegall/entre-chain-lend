// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/LoanManager.sol";

contract LoanManagerTest is Test {
    LoanManager public loanManager;
    address borrower = address(0xBEEF);
    address funder1 = address(0xCAFE);
    address funder2 = address(0xDEAD);

    function setUp() public {
        loanManager = new LoanManager();
        vm.deal(borrower, 10 ether);
        vm.deal(funder1, 10 ether);
        vm.deal(funder2, 10 ether);
    }

    function testCreateLoanRequest() public {
        vm.prank(borrower);
        loanManager.createLoanRequest(2 ether, 5, 10, keccak256("zkproof"));

        (
            address b,
            uint256 amount,
            ,
            ,
            uint256 rate,
            ,
            ,
        ) = loanManager.getLoan(0);

        assertEq(b, borrower);
        assertEq(amount, 2 ether);
        assertEq(rate, 10);
    }

    function testFundLoanAndRepay() public {
        vm.prank(borrower);
        loanManager.createLoanRequest(1 ether, 1, 20, keccak256("zk"));

        vm.prank(funder1);
        loanManager.fundLoan{value: 0.6 ether}(0);

        vm.prank(funder2);
        loanManager.fundLoan{value: 0.4 ether}(0);

        vm.warp(block.timestamp + 2 days);

        uint256 repayment = 1 ether + (1 ether * 20) / 100;
        vm.prank(borrower);
        loanManager.repayLoan{value: repayment}(0);

        assertEq(borrower.balance, 10 ether - repayment);
        assertEq(funder1.balance, 10 ether + (0.6 ether * 20) / 100);
        assertEq(funder2.balance, 10 ether + (0.4 ether * 20) / 100);
    }
}
