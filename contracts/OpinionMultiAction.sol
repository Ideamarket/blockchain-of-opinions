//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/INFTOpinionBase.sol";
import "./interfaces/IIdeamarketPosts.sol";

/**
 * @title FeeMultiAction
 * @author Kelton Madden
 *
 * @dev takes a fee while rating
 */

 contract OpinionMultiAction {
    
    IIdeamarketPosts _opinionBase;
    IIdeamarketPosts _ideamarketPosts;

    constructor(address ideamarketPosts, address ideamarketAdmin) {
        _opinionBase = INFTOpinionBase(ideamarketPosts);
        _ideamarketPosts = IIdeamarketPosts(ideamarketPosts);
        _ideamarketAdmin = ideamarketAdmin;
    }

    function post(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) external {
        address tokenOwner = _ideamarketPosts.ownerOf(tokenID);
        (bool success, ) = tokenOwner.call{value: msg.value}("");
        require(success, "transfer-failed");
        _opinionBase.writeOpinion(tokenID, rating,citations, inFavorArr);
 }