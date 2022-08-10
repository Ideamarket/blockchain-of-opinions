//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/INFTOpinionBase.sol";
import "./utils/Initializable.sol";
import "./utils/Ownable.sol";
import "./IdeamarketPosts.sol";
import "./interfaces/IArbSys.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title NFTOpinionBase
 * @author Kelton Madden
 *
 * @dev Stores and retrieves opinions
 */

contract NFTOpinionBase is INFTOpinionBase, Initializable, Ownable {

    // contractAddress => uint => all opinions for a given tokenID
    mapping(uint => Opinion[]) _opinions;

    // uint => user wallet address => the opinions they have made about that tokenID
    mapping(uint => mapping(address => Opinion[])) _userOpinions;

    // wallet address => all opinions made by that address
    mapping(address => Opinion[]) _totalUserOpinions;

    // uint => address[] of users who have made opinions about that tokenID
    mapping(uint => address[]) _opinionatorList;

    // user address => uint claimable fees
    mapping(address => uint) _claimableFees;

    uint[] _opinionedTokenIDs;
    uint public _totalOpinionNumber;

    uint public _fee;
    bool public _feeSwitch;

    IArbSys _arbSys;
    IdeamarketPosts _posts;

    event NewOpinion(uint tokenID, address user, uint8 rating, uint[] citations, bool[] inFavorArr);

    function initialize(address ideamarketPosts, address owner) external initializer {
        require(ideamarketPosts != address(0), "zero address");
        _arbSys = IArbSys(address(100));
        _posts = IdeamarketPosts(ideamarketPosts);
        setOwnerInternal(owner);
    }

    function writeOpinion(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr, address opinionWriter) external override payable {
        require(!_feeSwitch || msg.value == _fee, "invalid fee");
        _claimableFees[_posts.ownerOf(tokenID)] += _fee;
        checkInput(tokenID, rating, citations, inFavorArr);
        uint blockHeight = _arbSys.arbBlockNumber();
        Opinion memory opinion = Opinion(opinionWriter, tokenID, rating, citations, inFavorArr, blockHeight);
        if (_opinions[tokenID].length == 0) {
            _opinionedTokenIDs.push(tokenID);
        }
        _opinions[tokenID].push(opinion);
        if (_userOpinions[tokenID][opinionWriter].length == 0) {
            _opinionatorList[tokenID].push(opinionWriter);
        }
        _userOpinions[tokenID][opinionWriter].push(opinion);
        _totalUserOpinions[opinionWriter].push(opinion);
        _totalOpinionNumber++;

        emit NewOpinion(tokenID, opinionWriter, rating, citations, inFavorArr);
    }

    function checkInput(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) public view {
        require(rating != 50, "rating must not be 50");
        require(citations.length <= 10, "too many citations");
        require(citations.length == inFavorArr.length, "citation arr length must equal inFavorArr length");
        for (uint i; i < citations.length; i++) {
            if (citations[i] == tokenID || citations[i] > _posts.totalSupply() ||(citations[i] == 0 && citations.length != 1)) {
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

    function getOpinionsAboutNFT(uint tokenID) external view override returns (Opinion[] memory) {
        return _opinions[tokenID];
    }

    function getUsersOpinions(address user) external view override returns (Opinion[] memory) {
        return _totalUserOpinions[user];
    }

    function getLatestOpinionsAboutNFT(uint tokenID) external view override returns (Opinion[] memory) {
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

    function changeFeePrice(uint newFee) external override onlyOwner {
        _fee = newFee;
    }

    function flipFeeSwitch() external override onlyOwner {
        _feeSwitch = !_feeSwitch;
    }

    function claimableFees(address user) external view override returns (uint) {
        return _claimableFees[user];
    }

    function withdrawClaimableFees() public override {
        uint val = _claimableFees[msg.sender];
        _claimableFees[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: val}("");
        require(success, "Transfer failed");
    }
}