// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint256 public balance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PinChanged(address account);
    event InflationCalculated(uint256 inflatedAmount);
    event CompoundInterestCalculated(uint256 compoundInterest);

    constructor(uint256 initBalance) payable {
        owner = msg.sender;
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    // custom error
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function changePin() public {
        require(msg.sender == owner, "Only the owner can change the PIN");
        // Emit event
        emit PinChanged(msg.sender);
    }

    function calculateInflation(uint256 _amount, uint256 _years, uint256 _inflationRate) public pure returns(uint256) {
        // Calculate inflated amount
        uint256 inflatedAmount = _amount * (100 + _inflationRate) ** _years / 100;
        return inflatedAmount;
    }

    function calculateCompoundInterest(uint256 _principal, uint256 _interestRate, uint256 _years, uint256 _compoundFrequency) public pure returns(uint256) {
        // Calculate compound interest
        uint256 compoundInterest = _principal * ((1 + (_interestRate / 100) / _compoundFrequency) ** (_compoundFrequency * _years)) - _principal;
        return compoundInterest;
    }
}
