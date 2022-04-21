//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import { Base64 } from "base64-sol/base64.sol";

import "hardhat/console.sol";

/**
 * @title IdeamarketPosts
 * @author Kelton Madden
 *
 * @dev mints erc721 tokens representing "posts" on ideamarket
 */

contract IdeamarketPosts is IIdeamarketPosts, ERC721Enumerable, AccessControl {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // list of tokenIDs a particular address minted
    mapping(address => uint[]) mintedTokens;
    //fix make sure this is working properly
    // metadata for posts by tokenID
    mapping(uint => Post) public posts;
    // mapping of existing category tags
    mapping(string => bool) public categories;
    // categories tagged for a given post
    // tokenID => string => bool
    mapping(uint => mapping(string => bool)) public postCategories;

    constructor(address admin) ERC721("IdeamarketPosts", "IMPOSTS") {
        _setupRole(ADMIN_ROLE, admin);("ADMIN_ROLE", admin);
    }
    
    function mint(string calldata content, string[] memory categoryTags, string calldata imageLink, 
        bool urlBool, string calldata urlContent, address recipient) external {
        
        require(bytes(content).length > 0, "content-empty");
        require(recipient != address(0), "zero-addr");

        uint tokenID = totalSupply() + 1;
        string[] memory validCategoryTags = filterValidCategories(tokenID, categoryTags);
        
        Post memory post = Post({
            minter: msg.sender,
            content: content,
            categories: validCategoryTags,
            imageLink: imageLink,
            isURL: urlBool,
            urlContent: urlContent,
            blockHeight: block.number
        });

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
                    "'minter': '", Strings.toHexString(uint160(currentPost.minter), 20), "',",
                    "'content': '", currentPost.content, "',",
                    "'image': '", currentPost.imageLink, "',",
                    "'categories': '", categoryString, "',",
                    "'isURL': '", Strings.toString(toUInt256(currentPost.isURL)), "',",
                    "'urlContent': '", currentPost.urlContent, "',",
                    "'blockHeight': '", Strings.toString(currentPost.blockHeight),
                "'}"
            ))
        ));
    }

    function addCategories(string[] calldata newCategories) external override{
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < newCategories.length; i++) {
            categories[newCategories[i]] = true;
        }
    }

    function removeCategories(string[] calldata oldCategories) external override{
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < oldCategories.length; i++) {
            categories[oldCategories[i]] = false;
        }
    }

    function addCategoriesToPost(uint tokenID, string[] calldata newCategories) external override{
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < newCategories.length; i++) {
            if(categories[newCategories[i]]) {
                postCategories[tokenID][newCategories[i]] = true;
                posts[tokenID].categories.push(newCategories[i]);
            }
        }
    }

    function resetCategoriesForPost(uint tokenID, string[] calldata newCategories) external override {
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < posts[tokenID].categories.length; i++) {
            postCategories[tokenID][posts[tokenID].categories[i]] = false;
        }
        delete posts[tokenID].categories;
        for (uint i = 0; i < newCategories.length; i++) {
            if(categories[newCategories[i]]) {
                postCategories[tokenID][newCategories[i]] = true;
                posts[tokenID].categories.push(newCategories[i]);
            }
        }
    }

    function updateImage(uint tokenID, string calldata imageLink) external override{
        require(msg.sender == ownerOf(tokenID) || hasRole(ADMIN_ROLE, msg.sender), "only-token-owner-or-admin");
        posts[tokenID].imageLink = imageLink;
    }
    
    function updateURLContent(uint tokenID, string calldata urlContent) external override {
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        require(posts[tokenID].isURL, "post-is-not-a-url");
        posts[tokenID].urlContent = urlContent;
    }

    function getPost(uint tokenID) external view override returns (Post memory post) {
        require(_exists(tokenID), "nonexistent token");
        return posts[tokenID];
    }
    
    function getUsersPosts(address user) external view override returns (uint[] memory) {
        return mintedTokens[user];
    }

    function isURL(uint tokenID) external view override returns (bool) {
        return posts[tokenID].isURL;
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721Enumerable, AccessControl) returns (bool) {
        return interfaceId == type(IAccessControl).interfaceId || super.supportsInterface(interfaceId);
    }

    function stringifyCategories(string[] memory categoryTags) internal pure returns(string memory) {
        string memory categoryString = "[";
        for (uint i = 0; i < categoryTags.length; i++) {
            if (i == 0) {
                categoryString = string(abi.encodePacked(categoryString, categoryTags[i]));
            }
            else {
                categoryString = string(abi.encodePacked(categoryString, ", ", categoryTags[i]));
            }
        }
        return string(abi.encodePacked(categoryString, "]"));
    }
    
    function filterValidCategories(uint tokenID, string[] memory categoryTags) internal returns(string[] memory) {
        uint validCategoryTagsLength;
        for (uint i = 0; i < categoryTags.length; i++) {
            if (categories[categoryTags[i]]) {
                validCategoryTagsLength++;
                postCategories[tokenID][categoryTags[i]] = true;
            } else {
                delete categoryTags[i];
            }
        }
        string[] memory validCategoryTags = new string[](validCategoryTagsLength);
        uint validIndex;
        for (uint i; i < categoryTags.length; i++) {
            if (categories[categoryTags[i]]) {
                validCategoryTags[validIndex] = categoryTags[i];
                validIndex++;
            }
        }
        return validCategoryTags;
    }

    function toUInt256(bool x) internal pure returns (uint r) {
        assembly { r := x }
    }

}