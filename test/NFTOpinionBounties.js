const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("NFTOpinionBounties", () => {

	let alice, bob, charlie
	let opinionBase
	let ideamarketPosts
  let opinionBounties
  let someToken, someOtherToken

    beforeEach(async () => {
      const accounts = await ethers.getSigners();
      alice = accounts[0];
      bob = accounts[1];
      charlie = accounts[2];
      const IdeamarketPosts = await ethers.getContractFactory("IdeamarketPosts");
      ideamarketPosts = await IdeamarketPosts.deploy(alice.address);
      const OpinionBase = await ethers.getContractFactory("NFTOpinionBase");
      opinionBase = await OpinionBase.deploy();
      await opinionBase.connect(alice).initialize(ideamarketPosts.address);
      const OpinionBounties = await ethers.getContractFactory("NFTOpinionBounties");
      opinionBounties = await OpinionBounties.deploy();
      const ERC20 = await ethers.getContractFactory("TestERC20");
      someToken = await ERC20.deploy('SOME', 'SOME');
      someOtherToken = await ERC20.deploy('OTHER', 'OTHER');
      await opinionBounties.connect(alice).initialize(alice.address, opinionBase.address, 
              [someToken.address, someOtherToken.address], [0, 50], true);
      for (i = 0; i <= 15; i++) {
        await ideamarketPosts.connect(alice).mint("hi", [], [], "", 
              false, "", alice.address)
      }
	})

	it("[sanity]: should write opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(1,  98, [0], [true]);
		const opinion = await opinionBase.getOpinion(1, alice.address);
		expect(opinion[0]['citations'][0]).to.equal(0);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

})
