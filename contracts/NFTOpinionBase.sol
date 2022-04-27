//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/INFTOpinionBase.sol";

/**
 * @title NFTOpinionBase
 * @author Kelton Madden
 *
 * @dev Stores and retrieves opinions
 */

contract NFTOpinionBase is INFTOpinionBase {

    // contractAddress => uint => user wallet address => the opinions they have made about that address
    mapping(address => mapping(uint => mapping(address => Opinion[]))) _userOpinions;

    // wallet address => all opinions made by that address
    mapping(address => Opinion[]) _totalUserOpinions;

    // contractAddress => uint => all opinions for a given given address and tokenID
    mapping(address => mapping(uint => Opinion[])) _opinions;

    // contractAddress => tokenIDArray
    mapping(address => uint[]) _opinionedTokenIDs;

    // contract Address => number of opinions about it
    mapping(address => uint) _addressOpinionCount;

    // contractAddress => uint => address[] of users who have made opinions about that address and tokenID
    mapping(address => mapping(uint => address[])) _opinionatorList;

    // TokenIDPair array storing all tokenID pairs about which opinions have been made
    TokenIDPair[] _opinionedNFTs;

    uint totalOpinionNumber;
    
    event NewOpinion(address contractAddress, uint tokenID, address user, uint8 rating, string comment, uint blockHeight);

    function writeOpinion(address contractAddress, uint tokenID, uint8 rating, string calldata comment) external override {
        
        require(rating != 50, "rating must not be 50");
        require(bytes(comment).length <= 560, "comment must be lte 560 characters");
        Opinion memory opinion = Opinion(msg.sender, contractAddress,tokenID, rating, comment, block.number);
        _userOpinions[contractAddress][tokenID][msg.sender].push(opinion);
        _totalUserOpinions[msg.sender].push(opinion);

        if (_opinions[contractAddress][tokenID].length == 0) {
            _opinionedNFTs.push(TokenIDPair(contractAddress, tokenID));
            _opinionedTokenIDs[contractAddress].push(tokenID);
        }
        _opinions[contractAddress][tokenID].push(opinion);

        if (_userOpinions[contractAddress][tokenID][msg.sender].length == 1) {
            _opinionatorList[contractAddress][tokenID].push(msg.sender);
        }

        _addressOpinionCount[contractAddress]++;
        totalOpinionNumber++;
        emit NewOpinion(contractAddress, tokenID, msg.sender, rating, comment, block.number);
    }

    function getOpinion(address contractAddress, uint tokenID, address user) external view override returns (Opinion[] memory) {
        return _userOpinions[contractAddress][tokenID][user];
    }

    function getUsersOpinions(address user) external view override returns (Opinion[] memory) {
        return _totalUserOpinions[user];
    }

    function getOpinionsAboutNFT(address contractAddress, uint tokenID) external view override returns (Opinion[] memory) {
        return _opinions[contractAddress][tokenID];
    }

    function getLatestOpinionsAboutNFT(address contractAddress, uint tokenID) external view override returns (Opinion[] memory) {
        Opinion[] memory latestOpinions = new Opinion[](_opinionatorList[contractAddress][tokenID].length);
        for (uint i = 0; i < _opinionatorList[contractAddress][tokenID].length; i++) {
            uint latestOpinionIndex = _userOpinions[contractAddress][tokenID][_opinionatorList[contractAddress][tokenID][i]].length - 1;
            latestOpinions[i] = _userOpinions[contractAddress][tokenID][_opinionatorList[contractAddress][tokenID][i]][latestOpinionIndex];
        }
        return latestOpinions;
    }

    function getOpinionedNFTs() external view override returns (TokenIDPair[] memory) {
        return _opinionedNFTs;
    }

    function getOpinionedNFTsForAddress(address contractAddress) external view override returns (uint[] memory) {
        return _opinionedTokenIDs[contractAddress];
    }

    function getAllOpinionsForAddress(address contractAddress) external view override returns (Opinion[] memory) {
        Opinion[] memory allOpinions = new Opinion[](_addressOpinionCount[contractAddress]);
        uint k;
        for (uint i = 0; i < _opinionedTokenIDs[contractAddress].length; i++) {
            for (uint j = 0; j < _opinions[contractAddress][_opinionedTokenIDs[contractAddress][i]].length; j++) {
                allOpinions[k] = _opinions[contractAddress][_opinionedTokenIDs[contractAddress][i]][j];
                k++;
            }
        }
        return allOpinions;
    }

    function getAllOpinions() external view override returns (Opinion[] memory) {
        Opinion[] memory allOpinions = new Opinion[](totalOpinionNumber);
        uint k;
        for (uint i = 0; i < _opinionedNFTs.length; i++) {
            for (uint j = 0; j < _opinions[_opinionedNFTs[i].contractAddress][_opinionedNFTs[i].tokenID].length; j++) {
                allOpinions[k] = _opinions[_opinionedNFTs[i].contractAddress][_opinionedNFTs[i].tokenID][j];
                k++;
            }
        }
        return allOpinions;
    }
}