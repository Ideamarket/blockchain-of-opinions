//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title INFTOpinionBase
 * @author Kelton Madden
 */

interface INFTOpinionBase {
    struct Opinion {
        address author;
        address contractAddress;
        uint8 rating;
        string comment;
        uint blockHeight;
    }
    function writeOpinion(address contractAddress, uint tokenID, uint8 rating, string calldata comment) external;
    function getOpinion(address contractAddress, uint tokenID, address user) external view returns (Opinion[] memory);
    function getUsersOpinions(address user) external view returns (Opinion[] memory);
    function getOpinionsAboutNFT(address contractAddress, uint tokenID) external view returns (Opinion[] memory);
    function getLatestOpinionsAboutNFT(address contractAddress, uint tokenID) external view returns (Opinion[] memory);
    function getOpinionedNFTs() external view returns (address[] memory);
    function getAllOpinions() external view returns (Opinion[] memory);
}
