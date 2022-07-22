//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";

/**
 * @title PostMultiAction
 * @author Kelton Madden
 *
 * @dev takes a fee while posting
 */

 contract PostMultiAction {
    
    IIdeamarketPosts _ideamarketPosts;
    address _ideamarketAdmin;

    constructor(address ideamarketPosts, address ideamarketAdmin) {
        _ideamarketPosts = IIdeamarketPosts(ideamarketPosts);
        _ideamarketAdmin = ideamarketAdmin;
    }

    function post(string calldata content, string[] memory imageHashes, string[] memory categoryTags, string calldata imageLink, 
        bool urlBool, string calldata urlContent, address recipient) external {
        (bool success, ) = _ideamarketAdmin.call{value: msg.value}("");
        require(success, "transfer-failed");
        _ideamarketPosts.mint(content, imageHashes, categoryTags, imageLink, urlBool, urlContent, recipient);
 }