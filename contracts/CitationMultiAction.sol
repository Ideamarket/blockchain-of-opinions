//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IdeamarketPosts.sol";
import "./interfaces/INFTOpinionBase.sol";


/**
 * @title CitationMultiAction
 * @author Kelton Madden
 *
 * @dev posts and write opinion in one tx
 */

contract CitationMultiAction {
    IdeamarketPosts _postsSupply;
    address _posts;
    address _nftOpinionBase;

    constructor(address posts, address nftOpinionBase) {
        _postsSupply = IdeamarketPosts(posts);
        _posts = posts;
        _nftOpinionBase = nftOpinionBase;
    }

    function postAndCite(string calldata content, uint8 rating, address recipient, uint tokenID) external payable returns(bool) {
        require(msg.value == .002 ether, "invalid amount");
        (bool success,) = _posts.call{value: msg.value / 2}(abi.encodeWithSignature("mint(string,address)", content, recipient));
        if (!success) { return false;}
        bool b = false;
        if (rating > 50) {
            b = true;
        }
        uint[] memory citations = new uint[](1);
        citations[0] =  _postsSupply.totalSupply();
        bool[] memory boolArr = new bool[](1);
        boolArr[0] =  b;
        (bool successOpinion,) =_nftOpinionBase.call{value: msg.value / 2}(abi.encodeWithSignature("writeOpinion(uint,uint8,uint[],bool[])", tokenID, rating, citations, boolArr));
        return successOpinion;
    }
}