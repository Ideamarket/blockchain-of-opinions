//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IIdeamarketPosts
 * @author Kelton Madden
 */

interface IIdeamarketPosts {
    struct Post {
        address minter;
        string content;
        string[] categories;
        string imageLink;
        bool isURL;
        bool isWeb2URL;
        string web2Content; 
        uint blockHeight;
    }

    function addCategories(string[] calldata categories) external;
    function removeCategories(string[] calldata categories) external;
    function addCategoriesToPost(uint tokenID, string[] calldata category) external;
    function removeCategoriesFromPost(uint tokenID, string[] calldata category) external;
    function updateImage(uint tokenID, string calldata imageLink) external;
    function getPost(uint tokenID)  external view returns (Post memory);
    function getUsersPosts(address user) external view returns (uint[] memory);
    function isURL(uint tokenID) external view returns (bool);
}
