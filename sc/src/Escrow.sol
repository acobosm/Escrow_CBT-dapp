// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "openzeppelin-contracts/contracts/access/Ownable.sol";
import {
    ReentrancyGuard
} from "openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "openzeppelin-contracts/contracts/token/ERC20/IERC20.sol";

contract Escrow is Ownable, ReentrancyGuard {
    struct Operation {
        uint256 id;
        address creator;
        address tokenA; // Token provided by creator
        address tokenB; // Token wanted by creator
        uint256 amountA; // Amount provided
        uint256 amountB; // Amount wanted
        bool active;
        bool completed;
        bool cancelled;
    }

    uint256 private _nextOperationId;
    mapping(uint256 => Operation) public operations;
    mapping(address => bool) public isTokenAllowed;
    address[] public allowedTokensList;

    event TokenAdded(address indexed token);
    event OperationCreated(
        uint256 indexed id,
        address indexed creator,
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint256 amountB
    );
    event OperationCompleted(uint256 indexed id, address indexed completer);
    event OperationCancelled(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    function addToken(address _token) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!isTokenAllowed[_token], "Token already allowed");

        isTokenAllowed[_token] = true;
        allowedTokensList.push(_token);
        emit TokenAdded(_token);
    }

    function createOperation(
        address _tokenA,
        address _tokenB,
        uint256 _amountA,
        uint256 _amountB
    ) external nonReentrant {
        require(isTokenAllowed[_tokenA], "Token A not allowed");
        require(isTokenAllowed[_tokenB], "Token B not allowed");
        require(_amountA > 0, "Amount A must be > 0");
        require(_amountB > 0, "Amount B must be > 0");

        // Transfer Token A from creator to Escrow
        IERC20(_tokenA).transferFrom(msg.sender, address(this), _amountA);

        uint256 opId = _nextOperationId++;
        operations[opId] = Operation({
            id: opId,
            creator: msg.sender,
            tokenA: _tokenA,
            tokenB: _tokenB,
            amountA: _amountA,
            amountB: _amountB,
            active: true,
            completed: false,
            cancelled: false
        });

        emit OperationCreated(
            opId,
            msg.sender,
            _tokenA,
            _tokenB,
            _amountA,
            _amountB
        );
    }

    function completeOperation(uint256 _opId) external nonReentrant {
        Operation storage op = operations[_opId];
        require(op.active, "Operation not active");
        require(
            msg.sender != op.creator,
            "Creator cannot complete own operation"
        );

        op.active = false;
        op.completed = true;

        // Transfer Token B from completer to Creator
        IERC20(op.tokenB).transferFrom(msg.sender, op.creator, op.amountB);

        // Transfer Token A from Escrow to Completer
        IERC20(op.tokenA).transfer(msg.sender, op.amountA);

        emit OperationCompleted(_opId, msg.sender);
    }

    function cancelOperation(uint256 _opId) external nonReentrant {
        Operation storage op = operations[_opId];
        require(op.active, "Operation not active");
        require(msg.sender == op.creator, "Only creator can cancel");

        op.active = false;
        op.cancelled = true;

        // Refund Token A to Creator
        IERC20(op.tokenA).transfer(op.creator, op.amountA);

        emit OperationCancelled(_opId);
    }

    function getAllowedTokens() external view returns (address[] memory) {
        return allowedTokensList;
    }

    function getAllOperations() external view returns (Operation[] memory) {
        Operation[] memory allOps = new Operation[](_nextOperationId);
        for (uint256 i = 0; i < _nextOperationId; i++) {
            allOps[i] = operations[i];
        }
        return allOps;
    }
}
