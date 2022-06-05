//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/INFTOpinionBounties.sol";
import "./utils/Ownable.sol";
import "./utils/Initializable.sol";
import "./interfaces/INFTOpinionBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./interfaces/IArbSys.sol";

/**
 * @title NFTOpinionBounties
 * @author Kelton Madden
 *
 * @dev Allows for posting and claiming of bounties for opinions
 */

 contract NFTOpinionBounties is INFTOpinionBounties, Ownable, Initializable {

    // tokenAddress => whether it is an acceptable bounty payment
    mapping(address => bool) _isValidPayment;
    // address => user address => paymentTokenAddress => bounty info
    mapping(uint => mapping(address => mapping(address => Bounty[]))) _bounties;
    // address => claimable owner fees
    mapping(address => uint) _ownerFees;
    // user address to Bounty[] of elibigle bounties for them
    address[] _payableTokens;

    address _eth = 0x0000000000000000000000000000000000000000;
    INFTOpinionBase _nftOpinionBase;
    IArbSys _arbSys = IArbSys(address(100));

    event BountyOffered(uint tokenID, address user, address depositor, address token, uint amount);
    event BountyClaimed(uint tokenID, address user, address token, uint amount);
    event BountyRescinded(uint tokenID, address user, address depositor, address token, uint amount);
    //FIX INitalizaier
    
    constructor(address owner, address addressOpinionBase, address[] memory payableTokens) {
        setOwnerInternal(owner);
        _nftOpinionBase = INFTOpinionBase(addressOpinionBase);
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

    function depositBounty(uint tokenID, address user, address depositor, address token, uint amount) external override payable {
        require(amount > 0, "amount must be greater than 0");
        require(_isValidPayment[token], "invalid bounty payment");
        require(token != _eth || (token == _eth && msg.value == amount), "invalid ETH amount");
        uint blockHeight = _arbSys.arbBlockNumber();
        Bounty memory bounty = Bounty(amount, depositor, blockHeight);
        //fix parse fees here and other functions
        _bounties[tokenID][user][token].push(bounty);
        if (token != _eth) {
            require(IERC20(token).transferFrom(depositor, address(this), amount), "Transfer failed");
        }

        emit BountyOffered(tokenID, user, depositor, token, amount);
    }

    function rescindBounty(uint tokenID, address user, address token) external override {
        uint amount;
        for (uint i = 0; i < _bounties[tokenID][user][token].length; i++) {
            if (_bounties[tokenID][user][token][i].depositor == msg.sender) {
                amount += _bounties[tokenID][user][token][i].amount;
                _bounties[tokenID][user][token][i] = _bounties[tokenID][user][token][_bounties[tokenID][user][token].length - 1];
                _bounties[tokenID][user][token].pop();
            }
        }
        if (token == _eth) {
            (bool success, ) = msg.sender.call{value:amount}("");
            require(success, "Transfer failed.");
        } else {
            require(IERC20(token).transfer(msg.sender, amount), "Transfer failed.");
        }

        emit BountyRescinded(tokenID, user, msg.sender, token, amount);
    }

    function claimBounty(uint tokenID, address token) external override {
        uint amount;
        INFTOpinionBase.Opinion[] memory opinions = _nftOpinionBase.getOpinion(tokenID, msg.sender);
        Bounty[] memory bounties = _bounties[tokenID][msg.sender][token];
        delete bounties;

        for (uint i = 0; i < bounties.length; i++) {
            if (opinions[opinions.length - 1].blockHeight <= bounties[i].blockHeight) {
                amount += bounties[i].amount;
            } else {
                _bounties[tokenID][msg.sender][token].push(bounties[i]);
            }
        }
        if (token == _eth) {
            (bool success, ) = msg.sender.call{value:amount}("");
            require(success, "Transfer failed.");
        } else {
            require(IERC20(token).transfer(msg.sender, amount), "Transfer failed.");
        }

        emit BountyClaimed(tokenID, msg.sender, token, amount);
    }

    function getAmountDepositedByUser(uint tokenID, address user, address token) external view override returns (uint) {
        uint amount;
        for (uint i = 0; i < _bounties[tokenID][user][token].length; i++) {
            if (_bounties[tokenID][user][token][i].depositor == msg.sender) {
                amount += _bounties[tokenID][user][token][i].amount;
            }
        }
        return amount;
    }

    function getBountyAmountPayable(uint tokenID, address user, address token) external view override returns (uint) {
        uint amount;
        INFTOpinionBase.Opinion[] memory opinions = _nftOpinionBase.getOpinion(tokenID, user);
        for (uint i = 0; i <  _bounties[tokenID][user][token].length; i++) {
            if (opinions[opinions.length - 1].blockHeight <=  _bounties[tokenID][user][token][i].blockHeight) {
                amount +=  _bounties[tokenID][user][token][i].amount;
            }
        }
        return amount;
    }

    function setBountyFees() external override onlyOwner() {

    }

    function withdrawOwnerFees() external override onlyOwner() {
        for (uint i; i < _payableTokens.length; i++) {
            if (_payableTokens[i] != _eth) {
                uint amount = _ownerFees[_payableTokens[i]];
                _ownerFees[_payableTokens[i]] = 0;
                require(IERC20(_payableTokens[i]).transfer(_owner, amount), "Transfer failed");

            } else {
                uint amount = _ownerFees[_payableTokens[i]];
                _ownerFees[_payableTokens[i]] = 0;
                (bool sent,) = _owner.call{value:amount}("");
                require(sent, "Transfer failed");
            }
        }
    }

    function getBountyInfo(uint tokenID, address user, address token) external view override returns (Bounty[] memory) {
        return _bounties[tokenID][user][token];
    }
 }