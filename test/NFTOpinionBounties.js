const { expectRevert, expectEvent, BN } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("NFTOpinionBounties", () => {

	let alice, bob, charlie
	let opinionBase
	let ideamarketPosts
  let opinionBounties
  let someToken, someOtherToken
  const pow18 = BigNumber.from('1000000000000000000')

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
  
  it("deposit and get bounty info", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)
  })

  it("deposit and get bounty info with fee", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someOtherToken.address)
    expect(bounty[0]['amount'].toString()).to.equal('950000000000000000')
    expect(bounty[0]['depositor']).to.equal(alice.address)
  })

  it("deposit and read info of multiple bounties", async () => {
    await someToken.connect(alice).mint(alice.address, '3000000000000000000')
    await someToken.connect(alice).approve(opinionBounties.address, '3000000000000000000')
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, '2000000000000000000')
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)
    expect(bounty[1]['amount'].toString()).to.equal('2000000000000000000')
    expect(bounty[1]['depositor']).to.equal(alice.address)
  })

  it("deposit and get amount payable with no opinion made", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('0')
  })

  it("deposit and get amount payable with no opinion made", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    await opinionBase.connect(alice).writeOpinion(1,  98, [], [])
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal(pow18.toString())
  })

  it("deposit and get amount payable with multiple deposits", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
    await someToken.connect(bob).mint(charlie.address, '2000000000000000000')
    await someToken.connect(charlie).approve(opinionBounties.address, '2000000000000000000')
    await opinionBase.connect(alice).writeOpinion(1,  98, [], [])
    let amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('0')
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
		await opinionBounties.connect(charlie).depositBounty(1, alice.address, charlie.address, someToken.address, '2000000000000000000')
    await opinionBase.connect(alice).writeOpinion(1,  98, [], [])
    amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('3000000000000000000')
  })

  it("deposit and get amount deposited by user", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someToken.address)
    expect(amount).to.equal(pow18.toString())
  })

})
