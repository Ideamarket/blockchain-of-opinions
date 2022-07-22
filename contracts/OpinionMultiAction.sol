//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/INFTOpinionBase.sol";

/**
 * @title FeeMultiAction
 * @author Kelton Madden
 *
 * @dev takes a fee while rating
 */

 contract OpinionMultiAction {
    
    IIdeamarketPosts _opinionBase;
    address _ideamarketAdmin;

    constructor(address ideamarketPosts, address ideamarketAdmin) {
        _opinionBase = INFTOpinionBase(ideamarketPosts);
        _ideamarketAdmin = ideamarketAdmin;
    }

    function post(uint tokenID, uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) external {
        (bool success, ) = _ideamarketAdmin.call{value: msg.value}("");
        require(success, "transfer-failed");
        _opinionBase.writeOpinion(tokenID, rating,citations, inFavorArr);
 }