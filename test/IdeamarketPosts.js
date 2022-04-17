const { expectRevert } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("IdeamarketPosts", () => {
    const token1Address = "0x0000000000000000000000000000000000000001";
    const token2Address = "0x0000000000000000000000000000000000000002";
    let alice, bob, charlie
    let opinionBase
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
        alice = accounts[0];
        bob = accounts[1];
        charlie = accounts[2];
        const OpinionBase = await ethers.getContractFactory("NFTOpinionBase");
        opinionBase = await OpinionBase.deploy();
    })

    it("should write opinion", async () => {
        await opinionBase.connect(alice).writeOpinion(token1Address, 1,  98, "I like this url a lot");
        const opinion = await opinionBase.getOpinion(token1Address, 1, alice.address);
        expect(opinion[0]['comment']).to.equal("I like this url a lot");
        expect(opinion[0]['contractAddress']).to.equal("0x0000000000000000000000000000000000000001");
        expect(opinion[0]['rating']).to.equal(98);
        expect(opinion[0]['author']).to.equal(alice.address);
        expect(opinion.length).to.equal(1);
    })
})
	