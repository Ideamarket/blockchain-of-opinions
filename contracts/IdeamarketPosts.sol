//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "./Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Base64 } from "base64-sol/base64.sol";

/**
 * @title IdeamarketPosts
 * @author Kelton Madden
 *
 * @dev mints erc721 tokens representing "posts" on ideamarket
 */

contract IdeamarketPosts is IIdeamarketPosts, ERC721Enumerable, Ownable {

    // list of tokenIDs a particular address minted
    mapping(address => uint[]) mintedTokens;
    // metadata for posts by tokenID
    mapping(uint => Post) public posts;
    // mapping of existing category tags
    mapping(string => bool) public categories;

    constructor(address owner) ERC721("IdeamarketPosts", "IMPOSTS") {
        setOwnerInternal(owner);
    }
    
    function mint(string calldata content, string[] calldata categoryTags,
        string calldata imageLink, bool web2URL, string  calldata web2Content, address recipient) external {
        require(bytes(content).length > 0, "content-empty");
        require(recipient != address(0), "zero-addr");
        for (uint i = 0; i < categoryTags.length; i++) {
            require(categories[categoryTags[i]], "category-not-found");
        }

        Post memory post = Post({
            minter: msg.sender,
            content: content,
            categories: categoryTags,
            imageLink: imageLink,
            web2URL: web2URL,
            web2Content: web2Content,
            blockHeight: block.number
        });
        uint tokenID = totalSupply() + 1;
        posts[tokenID] = post;
        mintedTokens[recipient].push(tokenID);
        _safeMint(recipient, tokenID);
    }

    function tokenURI(uint tokenID) public view override returns (string memory) {
        require(_exists(tokenID), "ERC721Metadata: URI query for nonexistent token");

        Post memory currentPost = posts[tokenID];
        string memory categoryString = stringifyCategories(currentPost.categories);
        // Create JSON for OpenSea
        return string(abi.encodePacked(
            "data:application/json;base64,", Base64.encode(abi.encodePacked(
                "{",
                    "'minter': '", currentPost.minter, "',",
                    "'content': '", currentPost.content, "', ",
                    "'image': '", currentPost.imageLink, "',",
                    "'categories': '", categoryString, "',",
                    "'web2URL': ", currentPost.web2URL, "',",
                    "'web2Content': '", currentPost.web2Content, "',",
                    "'blockHeight': ", currentPost.blockHeight,
                "}"
            ))
        ));
    }

    function getPost(uint tokenID) external view returns (Post memory post) {
        return posts[tokenID];
    }

    function stringifyCategories(string[] memory categoryTags) internal pure returns(string memory) {
        string memory categoryString = "[";
        for (uint i = 0; i < categoryTags.length; i++) {
                categoryString = string(abi.encodePacked(categoryString, ", ", categoryTags[i]));
        }
        return string(abi.encodePacked(categoryString, "]"));
    }


    function addCategories(string[] calldata categories) external;
    function removeCategories(string[] calldata categories) external;
    function addCategoriesToPost(string[] calldata category) external;
    function removeCategoriesFromPost(string[] calldata category) external;
    function getUsersPosts(address user) external view returns (uint[] memory);
    function isURL(uint tokenID) external view returns (bool);


 }