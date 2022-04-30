//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IOpinionBounties.sol";
import "./Ownable.sol";

/**
 * @title NFTOpinionBounties
 * @author Kelton Madden
 *
 * @dev Allows for posting and claiming of bounties for opinions
 */

 contract NFTOpinionBounties is IOpinionBounties, Ownable {

    // tokenAddress => whether it is an acceptable bounty payment
    mapping(address => bool) _isValidPayment;
    // address => user address => paymentTokenAddress => bounty info
    mapping(address => mapping(address => mapping(address => Bounty[]))) _bounties;
    
    // user address to Bounty[] of elibigle bounties for them
    address[] _payableTokens;

    address ETH = 0x0000000000000000000000000000000000000000;

    constructor(address owner, address  address[] memory payableTokens) {
        setOwnerInternal(owner);
        for (uint i; i < payableTokens.length; i++) {
            _isValidPayment[payableTokens[i]] = true;
            _payableTokens.push(payableTokens[i]);
        }
    }

    function addBountiableToken(address token) external override {
        require(token != address(0), "zero-addr");
        require(!_isValidPayment[token], "token already added");
        _isValidPayment[token] = true;
        _payableTokens.push(token);
    }

    function removeBountiableToken(address token) external override {
        require(_isValidPayment[token], "token not added");
        _isValidPayment[token]= false;
        for (uint i = 0; i < _payableTokens.length; i++) {
            if (_payableTokens[i] == token) {
                _payableTokens[i] = _payableTokens[_payableTokens.length - 1];
                _payableTokens.pop();
            }
        }
    }

    function offerBounty(address addy, address user, address depositor, address token, uint amount) external payable {
        require(amount > 0, "amount must be greater than 0");
        require(_isValidPayment[token], "invalid bounty payment");
        require(token != ETH || (token == ETH && msg.value == amount), "invalid ETH amount");
        Bounty memory bounty = Bounty(amount, depositor, block.number);
        _bounties[user][addy][token].push(bounty);
        //fix transfer tokens
    }

    function withdrawBounty(address addy, address user, address token) external {
        //fix should it include address parameter?
        uint amount;
        for (uint i = 0; i < _bounties[user][addy][token].length; i++) {
            if (_bounties[user][addy][token][i].depositor == msg.sender) {
                amount += _bounties[user][addy][token][i].amount;
                _bounties[user][addy][token][i] = _bounties[user][addy][token][_bounties[user][addy][token].length - 1];
                _bounties[user][addy][token].pop();
            }
        }
        //send tokens to user (amount)
    }

    function getBounties(address addy, address user, address token) external view override returns (Bounty[] memory) {
        return _bounties[addy][user][token];
    }

    function claimBounty(address addy, address user, address token) external override{

    }
    function getAmountDeposited(address addy, address user, address token) external view returns (uint amount);
    function getBountyAmountPayable(address addy, address user, address token) external view returns (uint amount);
    function getBountiesForUser(address user) external view returns (Bounty[] memory);
    function setBountyFees() external;
    function setFeeDistributorAddress() external;

 }