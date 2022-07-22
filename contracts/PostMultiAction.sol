//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IdeamarketPosts.sol";

/**
 * @title PostMultiAction
 * @author Kelton Madden
 *
 * @dev takes a fee while posting
 */

contract PostMultiAction {
    
    IdeamarketPosts _ideamarketPosts;
    address _ideamarketAdmin;

    constructor(address ideamarketPosts, address ideamarketAdmin) {
        _ideamarketPosts = IdeamarketPosts(ideamarketPosts);
        _ideamarketAdmin = ideamarketAdmin;
    }

    function post(string calldata content, string[] memory imageHashes, string[] memory categoryTags, string calldata imageLink, 
        bool urlBool, string calldata urlContent, address recipient) external payable {
        (bool success, ) = _ideamarketAdmin.call{value: msg.value}("");
        require(success, "transfer-failed");
        _ideamarketPosts.mint(content, imageHashes, categoryTags, imageLink, urlBool, urlContent, recipient);
    }
}