//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/INFTOpinionBase.sol";
import "./IdeamarketPosts.sol";

/**
 * @title FeeMultiAction
 * @author Kelton Madden
 *
 * @dev takes a fee while rating
 */

contract OpinionMultiAction {
    
    INFTOpinionBase _opinionBase;
    IdeamarketPosts _ideamarketPosts;

    constructor(address opinionBase, address ideamarketPosts) {
        _opinionBase = INFTOpinionBase(opinionBase);
        _ideamarketPosts = IdeamarketPosts(ideamarketPosts);
    }

    function post(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr, address minter) external payable {
        address tokenOwner = _ideamarketPosts.ownerOf(tokenID);
        (bool success, ) = tokenOwner.call{value: msg.value}("");
        require(success, "transfer-failed");
        _opinionBase.writeOpinion(tokenID, rating, citations, inFavorArr, minter);
    }
    
}