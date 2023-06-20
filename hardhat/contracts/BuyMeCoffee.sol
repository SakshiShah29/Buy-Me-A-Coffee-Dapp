// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract BuyMeCoffee{
    //event to emit when a memo is created

    event newMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    //Memo struct
    struct Memo{
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    ///address of the contract deployer marked payable so that 
    //we can withdraw to this address later
    address payable owner;

    //List from all memos recieved from coffee purchases
    Memo[] memos;

    constructor(){
        //stores the address of the deployer as a payable address
        // so when we withdraw the funds we'll withdraw here
        owner=payable(msg.sender);

    }

    function getMemos() public view returns (Memo[] memory){
        return memos;
    }

    function buyCoffee(string memory _name,string memory _message)public payable{
        //Must acccept more than 0 eth for coffee
        require(msg.value>0,"Cant buy coffee for free!");
        //Add the memo to storage!
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        //Emit a _NewMemo event with details about  the memo
        emit newMemo(
            msg.sender,block.timestamp,
            _name,
            _message
        );
    }

        function withdrawTips() public{
            require(owner.send(address(this).balance));
        }
    }
