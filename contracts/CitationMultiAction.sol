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
    IdeamarketPosts _posts;
    INFTOpinionBase _nftOpinionBase;

    constructor(address posts, address nftOpinionBase) {
        _posts = IdeamarketPosts(posts);
        _nftOpinionBase = INFTOpinionBase(nftOpinionBase);
    }

    function postAndCite(string calldata content, uint8 rating, string[] memory categoryTags, bool urlBool, 
        string calldata web2Content, address recipient, uint tokenID) external {
            string[] memory imageHashes = new string[](0);
            _posts.mint(content, imageHashes, categoryTags, "", urlBool, web2Content, recipient);
            bool b = false;
            if (rating > 50) {
                b = true;
            }
            uint[] memory citations = new uint[](1);
            citations[0] =  _posts.totalSupply();
            bool[] memory boolArr = new bool[](1);
            boolArr[0] =  b;
            _nftOpinionBase.writeOpinion(tokenID, rating, citations, boolArr);
    }
}