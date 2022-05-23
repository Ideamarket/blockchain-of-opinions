//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title INFTOpinionBase
 * @author Kelton Madden
 */

interface INFTOpinionBase {
    struct TokenIDPair {
        address contractAddress;
        uint tokenID;
    }

    struct Opinion {
        address author;
        address contractAddress;
        uint tokenID;
        uint8 rating;
        uint[] citations;
        bool[] inFavorArr;
        uint blockHeight;
    }

    function writeOpinion(address contractAddress, uint tokenID, 
        uint8 rating, uint[] calldata citations, bool[] calldata inFavorArr) external;
    function getOpinion(address contractAddress, uint tokenID, address user) external view returns (Opinion[] memory);
    function getUsersOpinions(address user) external view returns (Opinion[] memory);
    function getOpinionsAboutNFT(address contractAddress, uint tokenID) external view returns (Opinion[] memory);
    function getLatestOpinionsAboutNFT(address contractAddress, uint tokenID) external view returns (Opinion[] memory);
    function getOpinionedNFTsForAddress(address contractAddress) external view returns (uint[] memory);
    function getAllOpinionsForAddress(address contractAddress) external view returns (Opinion[] memory);
    function getOpinionedNFTs() external view returns (TokenIDPair[] memory);
    function getAllOpinions() external view returns (Opinion[] memory);
}