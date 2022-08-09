//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/IIdeamarketPosts.sol";
import "./interfaces/IArbSys.sol";
import "./utils/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";


/**
 * @title IdeamarketPosts
 * @author Kelton Madden
 *
 * @dev mints erc721 tokens representing "posts" on ideamarket
 */

contract IdeamarketPosts is IIdeamarketPosts, ERC721, Ownable {
    using Strings for uint256;

    // list of tokenIDs a particular address minted
    mapping(address => uint[]) _mintedTokens;

    string public _baseUri;
    string _contractUri;
    uint public _fee;
    bool public _feeSwitch;
    uint _totalSupply;
    // contract to retrieve arb block height
    IArbSys constant _arbSys = IArbSys(address(100));

    constructor(address owner, string memory contractUri, string memory baseUri) ERC721("IdeamarketPost", "IMPOST") {
        setOwnerInternal(owner);
        _contractUri = contractUri;
        _baseUri = baseUri;
    }
    
    function mint(address recipient) external payable {
        require(!_feeSwitch || msg.value == _fee, "invalid fee");
        require(recipient != address(0), "zero-addr");

        _mint(recipient, ++_totalSupply);
        _mintedTokens[recipient].push(_totalSupply);
    }

    function getUsersPosts(address user) external view override returns (uint[] memory) {
        return _mintedTokens[user];
    }

    function changeFeePrice(uint newPrice) external override onlyOwner {
        _fee = newPrice;
    }

    function flipFeeSwitch() external override onlyOwner{
        _feeSwitch = !_feeSwitch;
    }

    function withdrawOwnerFees() public override {
        (bool success, ) = _owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    function contractURI() public view returns (string memory) {
        return _contractUri;
    }

    function updateContractURI(string calldata contractUri) public {
        _contractUri = contractUri;
    }

    function updateBaseURI(string calldata baseUri) public {
        _baseUri = baseUri;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_exists(tokenId), "ERC721: uri query for nonexistent token");
        return bytes(_baseUri).length > 0 ? string(abi.encodePacked(_baseUri, tokenId.toString())) : "";
    }

    function totalSupply() public view returns (uint) {
        return _totalSupply;
    }

}