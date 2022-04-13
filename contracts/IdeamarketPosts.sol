//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";

/**
 * @title IdeamarketPosts
 * @author Kelton Madden
 *
 * @dev mints erc721 tokens representing "posts" on ideamarket
 */

contract IdeamarketPosts is IIdeamarketPosts, ERC721Enumerable, Ownable {
    // list of tokenIDs a particular address minted
    mapping(address => uint[]) mintedTokens;
    
    mapping (uint => Post) public posts;

    constructor(address owner) ERC721("IdeamarketPosts", "IMPOSTS") {
        setOwnerInternal(owner);
    }
    





 }