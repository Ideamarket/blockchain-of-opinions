//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "./interfaces/IOpinionBase.sol";
contract OpinionBase is IOpinionBase {

    // address => user wallet address => the opinions they have made about that address (token, wallet, etc)
    mapping(address => mapping(address => Opinion[])) private _userOpinion;

    // wallet address => all opinions made by that address
    mapping(address => uint) private _userOpinions;

    // address => all opinions for that given address
    mapping(address => Opinion[]) private _opinions;
    
    // address array storing all addresses about which opinions have been made
    address[] private _opinedAddresses;


    function writeOpinion(address addy, uint8 rating, string calldata comment) external override {

        Opinion memory opinion = Opinion(msg.sender, addy, rating, comment, block.timestamp);
        _userOpinions[addy][msg.sender].push(opinion);
        _userOpinions[msg.sender].push(opinion);
        _opinions[addy].push(opinion);
        _opinedAddresses.push(addy);
    }

    function getOpinion(address addy, address user) external override view returns (Opinion[] memory) {
        return _userOpinion[addy][user];
    }

    function getUsersOpinions(address user) external override view returns (Opinion[] memory) {
        return _userOpinions[user];
    }

    function getOpinionsAboutAddress(address addy) external override view returns (Opinion[] memory);
    function getOpinedAddresses() external override view returns (address[] memory);
    function getAllOpinions() external override view returns (Opinion[] memory);
    function migrateAddress(address[] calldata oldAddress, address[] calldata newAddress) external override;



}