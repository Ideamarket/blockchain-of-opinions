//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import { Base64 } from "base64-sol/base64.sol";

/**
 * @title IdeamarketPosts
 * @author Kelton Madden
 *
 * @dev mints erc721 tokens representing "posts" on ideamarket
 */
//fix make it admin controls (multiple?) and owner controls that.
//constructor sets owner as an admin
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

    constructor(bytes32 admin) ERC721("IdeamarketPosts", "IMPOSTS") {
        _setRoleAdmin("ADMIN_ROLE", admin);
    }
    
    function mint(string calldata content, string[] calldata categoryTags, string calldata imageLink, 
        bool urlBool, bool web2URLBool, string  calldata web2Content, address recipient) external {
        require(bytes(content).length > 0, "content-empty");
        require(recipient != address(0), "zero-addr");
        //check logic
        uint tokenID = totalSupply() + 1;
        for (uint i = 0; i < categoryTags.length; i++) {
            if (!categories[categoryTags[i]]) {
                continue;
            }
            postCategories[tokenID][categoryTags[i]] = true;
        }

        Post memory post = Post({
            minter: msg.sender,
            content: content,
            categories: categoryTags,
            imageLink: imageLink,
            isURL: urlBool,
            isWeb2URL: web2URLBool,
            web2Content: web2Content,
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
                    "'minter': '", currentPost.minter, "',",
                    "'content': '", currentPost.content, "', ",
                    "'image': '", currentPost.imageLink, "',",
                    "'categories': '", categoryString, "',",
                    "'isURL': '", currentPost.isURL, "',",
                    "'web2URL': ", currentPost.isWeb2URL, "',",
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

    function addCategories(string[] calldata newCategories) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < newCategories.length; i++) {
            if (categories[newCategories[i]]) {
                continue;
            }
            categories[newCategories[i]] = true;
        }
    }

    function removeCategories(string[] calldata oldCategories) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "admin-only");
        for (uint i = 0; i < oldCategories.length; i++) {
            categories[oldCategories[i]] = false;
        }
    }

    function addCategoriesToPost(uint tokenID, string[] calldata newCategories) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "only-admin");
        for (uint i = 0; i < newCategories.length; i++) {
            if (postCategories[tokenID][newCategories[i]]) {
                continue;
            }
            postCategories[tokenID][newCategories[i]] = true;
            posts[tokenID].categories.push(newCategories[i]);
        }
        
    }

    function removeCategoriesFromPost(uint tokenID, string[] calldata oldCategories) external {
        require(hasRole(ADMIN_ROLE, msg.sender), "only-admin");
        string[] memory currentCategories = posts[tokenID].categories;
        delete posts[tokenID].categories;
        for (uint i = 0; i < currentCategories.length; i++) {
            for (uint j; j < oldCategories.length; j++) {
                postCategories[tokenID][oldCategories[i]] = false;
                if (!(keccak256(abi.encodePacked(currentCategories[i])) == keccak256(abi.encodePacked(oldCategories[j])))) {
                    posts[tokenID].categories.push(currentCategories[i]);
                }
            }
        }
    }

    //fix can also be updated by current holder
    function updateImage(uint tokenID, string calldata imageLink) external {
        //fix admin
        require(msg.sender == ownerOf(tokenID) || hasRole(ADMIN_ROLE, msg.sender), "only-minter-or-admin");
        posts[tokenID].imageLink = imageLink;
    }

    function getUsersPosts(address user) external view returns (uint[] memory) {
        return mintedTokens[user];
    }

    function isURL(uint tokenID) external view returns (bool) {
        return posts[tokenID].isURL;
    }

    function isWeb2URL(uint tokenID) external view returns (bool) {
        return posts[tokenID].isWeb2URL;
    }


}