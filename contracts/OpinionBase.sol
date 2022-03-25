//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IOpinionBase.sol";

/**
 * @title OpinionBase
 * @author Kelton Madden
 *
 * @dev Stores and retrieves opinions
 */

contract OpinionBase is IOpinionBase {
//FFFFFFFFIIIIIIIIIIIIIIIIIIIIIXXXX ADD EVENTS 

    // address => user wallet address => the opinions they have made about that address (token, wallet, etc)
    mapping(address => mapping(address => Opinion[])) _userOpinion;

    // wallet address => all opinions made by that address
    mapping(address => Opinion[]) _userOpinions;

    // address => all opinions for that given address
    mapping(address => Opinion[]) _opinions;

    // address array storing all addresses about which opinions have been made
    address[] _opinedAddresses;

    uint totalOpinionNumber;
    
    event newOpinion(address addy, address user, uint8 rating, string comment, uint timestamp);

    function writeOpinion(address addy, uint8 rating, string calldata comment) external override {
        require(rating != 50, "rating must not be 50");
        require(bytes(comment).length == 0 || (bytes(comment).length >= 20 && bytes(comment).length <= 600), 
            "comment must be empty or between 20 and 600 characters");
        Opinion memory opinion = Opinion(msg.sender, addy, rating, comment, block.timestamp);
        _userOpinion[addy][msg.sender].push(opinion);
        _userOpinions[msg.sender].push(opinion);
        if (_opinions[addy].length == 0) {
            _opinedAddresses.push(addy);
        }
        _opinions[addy].push(opinion);
        totalOpinionNumber++;
        emit newOpinion(addy, msg.sender, rating, comment, block.timestamp);
    }

    function getOpinion(address addy, address user) external view override returns (Opinion[] memory) {
        return _userOpinion[addy][user];
    }

    function getUsersOpinions(address user) external view override returns (Opinion[] memory) {
        return _userOpinions[user];
    }

    function getOpinionsAboutAddress(address addy) external view override returns (Opinion[] memory) {
        return _opinions[addy];
    }

    function getOpinedAddresses() external view override returns (address[] memory) {
        return _opinedAddresses;
    }
    
    function getAllOpinions() external view override returns (Opinion[] memory) {
        Opinion[] memory allOpinions = new Opinion[](totalOpinionNumber);
        uint k;
        for (uint i = 0; i < _opinedAddresses.length; i++) {
            for (uint j = 0; j < _opinions[_opinedAddresses[i]].length; j++) {
                allOpinions[k] = _opinions[_opinedAddresses[i]][j];
                k++;
            }
        }
        return allOpinions;
    }

}