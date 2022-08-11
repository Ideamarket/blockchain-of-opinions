const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')
const keccak256 = require('keccak256')

describe("IdeamarketPosts", () => {
    let alice, bob, charlie
    let ideamarketPosts
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        alice = accounts[0];
        bob = accounts[1];
        charlie = accounts[2];
        const IdeamarketPosts = await ethers.getContractFactory("IdeamarketPosts");
        ideamarketPosts = await IdeamarketPosts.deploy(alice.address, "contractURI/IMPOSTS", "https://ideamarketposts/");
        await ideamarketPosts.deployed();
    })

    it("should mint post", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post).to.deep.equal('I love ideamarket!');
    })

    it("should mint multiple posts", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", alice.address);
        let supply = await ideamarketPosts.totalSupply();
        expect(supply).to.equal(1);
        await ideamarketPosts.connect(alice).mint("I like ideamarket!", alice.address);
        supply = await ideamarketPosts.totalSupply();
        expect(supply).to.equal(2);
        let post = await ideamarketPosts.getPost(1);
        expect(post).to.deep.equal('I love ideamarket!');
        post = await ideamarketPosts.getPost(2);
        expect(post).to.deep.equal('I like ideamarket!');
    })

    it("should fail mint with no content", async () => {
        await expectRevert(ideamarketPosts.connect(alice).mint("", alice.address), 'content-length');
    })

    it("should fail mint with 0x0 recipient", async () => {
               await expectRevert(ideamarketPosts.connect(alice).mint("hi", '0x0000000000000000000000000000000000000000'), 'zero-addr');
    })

    it("should mint for non admin", async () => {
        await ideamarketPosts.connect(bob).mint("I love ideamarket!", charlie.address);
    })

    it("tokenURI should work for post", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        expect(uri).to.deep.equal("https://ideamarketposts/1");
    })

    it("tokenURI for nonexistent token should fail", async () => {
        await expectRevert(ideamarketPosts.tokenURI(1), "ERC721Metadata: URI query for nonexistent token");
    })

    it("getPost for nonexistent token should fail", async () => {
        await expectRevert(ideamarketPosts.getPost(1), "nonexistent token");
    })

    it("should fetch mintedTokens for a given address", async () => {
        await ideamarketPosts.connect(alice).mint("I like ideamarket!", alice.address);
        await ideamarketPosts.connect(alice).mint("I like ideamarket!", alice.address);
        const posts = await ideamarketPosts.getUsersPosts(alice.address);
        expect(posts.length).to.deep.equal(2);
        expect(posts[0]).to.deep.equal(1);
        expect(posts[1]).to.deep.equal(2);
        expect(await ideamarketPosts.totalSupply()).to.deep.equal(2);
    })


})