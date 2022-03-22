//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IOpinionBase.sol";
import "./Ownable.sol";

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
    
    event newOpinion(address addy, address user, uint8 rating, bool hasComment, string comment, uint timestamp);

    function writeOpinion(address addy, uint8 rating, string calldata comment, bool hasComment) external override {
        require(rating != 50, "rating must not be 50");
        require(!hasComment || (bytes(comment).length >= 20 && bytes(comment).length <= 600), "comment must be between 20 and 600 characters");
        Opinion memory opinion = Opinion(msg.sender, addy, rating, hasComment, comment, block.timestamp);
        _userOpinion[addy][msg.sender].push(opinion);
        _userOpinions[msg.sender].push(opinion);
        _opinions[addy].push(opinion);
        _opinedAddresses.push(addy);

        emit newOpinion(addy, msg.sender, rating, hasComment, comment, block.timestamp);
    }

    function getOpinion(address addy, address user) external override view returns (Opinion[] memory) {
        return _userOpinion[addy][user];
    }

    function getUsersOpinions(address user) external override view returns (Opinion[] memory) {
        return _userOpinions[user];
    }

    function getOpinionsAboutAddress(address addy) external override view returns (Opinion[] memory) {
        return _opinions[addy];
    }

    function getOpinedAddresses() external override view returns (address[] memory) {
        return _opinedAddresses;
    }

}