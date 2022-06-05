//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "./interfaces/INFTOpinionBase.sol";


/**
 * @title CitationMultiAction
 * @author Kelton Madden
 *
 * @dev posts and write opinion in one tx
 */

contract CitationMultiAction {
    IIdeamarketPosts _posts;
    INFTOpinionBase _nftOpinionBase;

    constructor(address posts, address nftOpinionBase) {
        _posts = IIdeamarketPosts(posts);
        _nftOpinionBase = INFTOpinionBase(nftOpinionBase);
    }

    function postAndCite(string calldata content, string[] memory categoryTags, bool urlBool, address recipient,
        uint tokenID, uint8 rating, uint[] calldata otherCitations, bool[] calldata inFavorArr) external {
            //_posts.mint(content, [], categoryTags, "", urlBool, "", recipient);
            //_nftOpinionBase.writeOpinion()

    }

}