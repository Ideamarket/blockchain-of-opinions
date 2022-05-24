//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/INFTOpinionBase.sol";
import "./interfaces/IArbSys.sol";

/**
 * @title NFTOpinionBase
 * @author Kelton Madden
 *
 * @dev Stores and retrieves opinions
 */

contract NFTOpinionBase is INFTOpinionBase {

    // contractAddress => uint => all opinions for a given tokenID
    mapping(uint => Opinion[])) _opinions;

    // uint => user wallet address => the opinions they have made about that tokenID
    mapping(uint => mapping(address => Opinion[])) _userOpinions;

    // wallet address => all opinions made by that address
    mapping(address => Opinion[]) _totalUserOpinions;

    // uint => address[] of users who have made opinions about that tokenID
    mapping(uint => address[]) _opinionatorList;

    // tokenIDs about which opinions have been made
    uint[] _opinionedTokenIDs;

    uint _totalOpinionNumber;

    IArbSys constant _arbSys = IArbSys(address(100));

    event NewOpinion(uint tokenID, address user, uint8 rating, uint[] citations, bool[] inFavorArr);

    function writeOpinion(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) external override {
        checkInput(tokenID, rating, citations, inFavorArr);
        //fix
        //uint blockHeight = _arbSys.arbBlockNumber();
        uint blockHeight = block.number;
        Opinion memory opinion = Opinion(msg.sender, tokenID, rating, citations, inFavorArr, blockHeight);
        if (_opinions[tokenID].length == 0) {
            _opinionedTokenIDs.push(tokenID);
        }
        _opinions[tokenID].push(opinion);
        if (_userOpinions[tokenID][msg.sender].length == 0) {
            _opinionatorList[tokenID].push(msg.sender);
        }
        _userOpinions[tokenID][msg.sender].push(opinion);
        _totalUserOpinions[msg.sender].push(opinion);
        _totalOpinionNumber++;

        emit NewOpinion(tokenID, msg.sender, rating, citations, inFavorArr);
    }

    function checkInput(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) public {
        require(rating != 50, "rating must not be 50");
        require(citations.length <= 10, "too many citations");
        require(citations.length == inFavorArr.length, "citation arr length must equal inFavorArr length");
        for (uint i; i < citations.length; i++) {
            if (citations[i] == tokenID || (citations[i] == 0 && citations.length != 1)) {
                revert("invalid citation");
            } for (uint j = i + 1; j < citations.length; j++) {
                if (citations[i] == citations[j]) {
                    revert("repeat citation"); 
                }
            }
        }
    }

    function getOpinion(uint tokenID, address user) external view override returns (Opinion[] memory) {
        return _userOpinions[tokenID][user];
    }

    function getUsersOpinions(address user) external view override returns (Opinion[] memory) {
        return _totalUserOpinions[user];
    }

    function getLatestOpinions(uint tokenID) external view override returns (Opinion[] memory) {
        Opinion[] memory latestOpinions = new Opinion[](_opinionatorList[tokenID].length);
        for (uint i = 0; i < _opinionatorList[tokenID].length; i++) {
            uint latestOpinionIndex = _userOpinions[tokenID][_opinionatorList[tokenID][i]].length - 1;
            latestOpinions[i] = _userOpinions[tokenID][_opinionatorList[tokenID][i]][latestOpinionIndex];
        }
        return latestOpinions;
    }

    function getOpinionedNFTs() external view override returns (uint[] memory) {
        return _opinionedTokenIDs;
    }

    function getAllOpinions() external view override returns (Opinion[] memory) {
        Opinion[] memory allOpinions = new Opinion[](_totalOpinionNumber);
        uint k;
        for (uint i = 0; i < _opinionedTokenIDs.length; i++) {
            for (uint j = 0; j < _opinions[_opinionedTokenIDs[i]].length; j++) {
                allOpinions[k] = _opinions[_opinionedTokenIDs[i]][j];
                k++;
            }
        }
        return allOpinions;
    }
}