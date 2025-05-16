// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LoanManager {
    struct LoanRequest {
        address borrower;
        uint256 amount;
        uint256 fundedAmount;
        uint256 deadline;
        uint256 interestRate; // em porcentagem (ex: 5 = 5%)
        bytes32 zkCommitmentHash;
        address[] funders;
        mapping(address => uint256) contributions;
        bool repaid;
    }

    LoanRequest[] public loans;

    event LoanRequested(uint256 indexed id, address indexed borrower);
    event LoanFunded(uint256 indexed id, address indexed funder, uint256 amount);
    event LoanRepaid(uint256 indexed id);

    function createLoanRequest(
        uint256 amount,
        uint256 durationInDays,
        uint256 interestRate,
        bytes32 zkCommitmentHash
    ) external {
        require(amount > 0, "Valor deve ser maior que zero");
        require(durationInDays > 0, "Prazo deve ser maior que zero");

        LoanRequest storage loan = loans.push();
        loan.borrower = msg.sender;
        loan.amount = amount;
        loan.deadline = block.timestamp + durationInDays * 1 days;
        loan.interestRate = interestRate;
        loan.zkCommitmentHash = zkCommitmentHash;

        emit LoanRequested(loans.length - 1, msg.sender);
    }

    function fundLoan(uint256 loanId) external payable {
        LoanRequest storage loan = loans[loanId];
        require(block.timestamp < loan.deadline, "Prazo expirado");
        require(!loan.repaid, "Ja foi quitado");
        require(msg.value > 0, "Envie ETH para financiar");
        require(loan.fundedAmount + msg.value <= loan.amount, "Excede o valor pedido");

        if (loan.contributions[msg.sender] == 0) {
            loan.funders.push(msg.sender);
        }

        loan.fundedAmount += msg.value;
        loan.contributions[msg.sender] += msg.value;

        emit LoanFunded(loanId, msg.sender, msg.value);
    }

    function repayLoan(uint256 loanId) external payable {
        LoanRequest storage loan = loans[loanId];
        require(msg.sender == loan.borrower, "Apenas o tomador pode quitar");
        require(!loan.repaid, "Ja quitado");
        require(block.timestamp >= loan.deadline, "Ainda dentro do prazo");
        require(loan.fundedAmount == loan.amount, "Ainda nao financiado totalmente");

        uint256 totalWithInterest = loan.amount + (loan.amount * loan.interestRate) / 100;
        require(msg.value >= totalWithInterest, "Pagamento insuficiente");

        for (uint256 i = 0; i < loan.funders.length; i++) {
            address funder = loan.funders[i];
            uint256 contribution = loan.contributions[funder];
            uint256 payout = contribution + (contribution * loan.interestRate) / 100;
            payable(funder).transfer(payout);
        }

        loan.repaid = true;

        emit LoanRepaid(loanId);
    }

    function getLoan(uint256 loanId) external view returns (
        address borrower,
        uint256 amount,
        uint256 fundedAmount,
        uint256 deadline,
        uint256 interestRate,
        bytes32 zkCommitmentHash,
        bool repaid,
        address[] memory funders
    ) {
        LoanRequest storage loan = loans[loanId];
        return (
            loan.borrower,
            loan.amount,
            loan.fundedAmount,
            loan.deadline,
            loan.interestRate,
            loan.zkCommitmentHash,
            loan.repaid,
            loan.funders
        );
    }

    function getContribution(uint256 loanId, address funder) external view returns (uint256) {
        return loans[loanId].contributions[funder];
    }

    function loanCount() external view returns (uint256) {
        return loans.length;
    }
}

