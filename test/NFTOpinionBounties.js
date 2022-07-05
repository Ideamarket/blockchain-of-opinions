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
  let eth = '0x0000000000000000000000000000000000000000'

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
    expect(bounty[0]['bountyID'].toString()).to.equal('1');
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)    
    expect(bounty[0]['user']).to.equal(bob.address)
    expect(bounty[0]['token']).to.equal(someToken.address)
  })

  it("deposit and get bounty info with fee", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someOtherToken.address)
    expect(bounty[0]['bountyID'].toString()).to.equal('1');
    expect(bounty[0]['amount'].toString()).to.equal('950000000000000000')
    expect(bounty[0]['depositor']).to.equal(alice.address)
  })

  it("deposit and read info of multiple bounties", async () => {
    await someToken.connect(alice).mint(alice.address, '3000000000000000000')
    await someToken.connect(alice).approve(opinionBounties.address, '3000000000000000000')
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, '2000000000000000000')
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty[0]['bountyID'].toString()).to.equal('1');
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)
    expect(bounty[0]['user']).to.equal(bob.address)
    expect(bounty[0]['token']).to.equal(someToken.address)
    expect(bounty[1]['bountyID'].toString()).to.equal('2');
    expect(bounty[1]['amount'].toString()).to.equal('2000000000000000000')
    expect(bounty[1]['depositor']).to.equal(alice.address)
    expect(bounty[1]['user']).to.equal(bob.address)
    expect(bounty[1]['token']).to.equal(someToken.address)
  })

  it("deposit and get amount payable with no opinion made", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('0')
  })

  it("deposit and get amount payable with opinion made without citation", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    await opinionBase.connect(alice).writeOpinion(1,  98, [], [])
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('0')
  })

  it("deposit and get amount payable with opinion made with citation", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    await opinionBase.connect(alice).writeOpinion(1,  98, [2], [false])
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
    const allBounties = await opinionBounties.getAllBounties()
    expect(allBounties[0]['depositor']).to.equal(bob.address)
    expect(allBounties[0]['tokenID']).to.equal(1)
    expect(allBounties[1]['bountyID'].toString()).to.equal('2')
    expect(allBounties[1]['depositor']).to.equal(charlie.address)
    await opinionBase.connect(alice).writeOpinion(1,  98, [5, 6], [false, true])
    amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, alice.address, someToken.address)
    expect(amountPayable).to.equal('3000000000000000000')
  })

  it("deposit and claim without making an opinion", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
    await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    await opinionBounties.connect(bob).claimBounty(1, someToken.address)
  })

  it("deposit and claim with making an opinion made before bounty deposit", async () => {
    await someToken.connect(bob).mint(bob.address, pow18)
    await someToken.connect(bob).approve(opinionBounties.address, pow18)
    await opinionBase.connect(alice).writeOpinion(1,  98, [5], [false])
    await opinionBounties.connect(bob).depositBounty(1, alice.address, bob.address, someToken.address, pow18)
    await opinionBounties.connect(bob).claimBounty(1, someToken.address)
  })

  it("deposit and get amount deposited by user", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someToken.address)
    expect(amount).to.equal(pow18.toString())
  })

  it("withdraw owner fee", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('50000000000000000')
  })

  it("withdraw owner fee before bounty is withdrawn", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    let bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someOtherToken.address)
    expect(bounty[0]['amount'].toString()).to.equal('950000000000000000')
    expect(bounty[0]['depositor']).to.equal(alice.address)
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('50000000000000000')
    bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someOtherToken.address)
    expect(bounty[0]['amount'].toString()).to.equal('950000000000000000')
    await opinionBase.connect(bob).writeOpinion(1,  98, [2], [true])
    await opinionBounties.connect(bob).claimBounty(1, someOtherToken.address)
    expect(await someOtherToken.balanceOf(bob.address)).to.equal('950000000000000000')
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, someOtherToken.address)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someOtherToken.address)
    expect(amountPayable).to.equal('0')
    expect(amount.toString()).to.equal('0')
    await opinionBounties.connect(bob).claimBounty(1, someOtherToken.address)
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('50000000000000000')
    expect(await someOtherToken.balanceOf(bob.address)).to.equal('950000000000000000')
  })

  it("onlyOwner can withdraw owner fee", async () => {
    await expectRevert(opinionBounties.connect(bob).withdrawOwnerFees(), "only-owner")
  })

  it("deposit and rescind bounty", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    await opinionBounties.connect(alice).rescindBounty(1, bob.address, someToken.address, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty.length).to.equal(0)
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, someOtherToken.address)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someOtherToken.address)
    expect(amountPayable).to.equal('0')
    expect(amount.toString()).to.equal('0')
  })

  it("deposit and over rescind bounty", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    await opinionBounties.connect(alice).rescindBounty(1, bob.address, someToken.address, '2000000000000000000')
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty.length).to.equal(0)
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, someOtherToken.address)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someOtherToken.address)
    expect(amountPayable).to.equal('0')
    expect(amount.toString()).to.equal('0')
  })

  it("deposit and rescind half of bounty", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    await opinionBounties.connect(alice).rescindBounty(1, bob.address, someToken.address, '500000000000000000')
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty.length).to.equal(1)    
    await opinionBase.connect(bob).writeOpinion(1,  98, [2, 6, 8, 7], [true, false, true, true])
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, someToken.address)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someToken.address)
    expect(amountPayable).to.equal('500000000000000000')
    expect(amount.toString()).to.equal('500000000000000000')
  })

  it("withdraw owner fees after rescinding bounty", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    await opinionBounties.connect(alice).rescindBounty(1, bob.address, someOtherToken.address, '950000000000000000' )
    const fees = await opinionBounties.connect(alice).getOwnerFeesPayable(someOtherToken.address)
    expect(fees).to.equal('50000000000000000')
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('950000000000000000')
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal(pow18)
  })

  it("get Owner Fees Payable with no fees", async () => {
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    const fees = await opinionBounties.connect(alice).getOwnerFeesPayable(someToken.address)
    expect(fees).to.equal('0')
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('0')
  })

  it("get Owner Fees Payable with fees", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    const fees = await opinionBounties.connect(alice).getOwnerFeesPayable(someOtherToken.address)
    expect(fees).to.equal('50000000000000000')
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('50000000000000000')
  })

  it("owner fee switch works", async () => {
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
    await opinionBounties.connect(alice).toggleFeeSwitch()
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('0')
    await opinionBase.connect(bob).writeOpinion(1,  98, [2], [false])
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, someOtherToken.address)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, someOtherToken.address)
    expect(amountPayable).to.equal('1000000000000000000')
    expect(amount.toString()).to.equal('1000000000000000000')
    await opinionBounties.connect(bob).claimBounty(1, someOtherToken.address)
    expect(await someOtherToken.balanceOf(bob.address)).to.equal('1000000000000000000')
  })

  it("double toggle owner fee", async () => {
    await opinionBounties.connect(alice).toggleFeeSwitch()
    await someOtherToken.connect(alice).mint(alice.address, pow18)
    await someOtherToken.connect(alice).approve(opinionBounties.address, pow18)
    await opinionBounties.connect(alice).toggleFeeSwitch()
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someOtherToken.address, pow18)
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await someOtherToken.balanceOf(alice.address)).to.equal('50000000000000000')
  })

  it("add new bountiable token", async () => {
    await opinionBounties.connect(alice).removeBountiableToken(someToken.address)
    await expectRevert(opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18), 
      "invalid bounty payment")
    await opinionBounties.connect(alice).addBountiableToken(someToken.address)
    await someToken.connect(alice).mint(alice.address, pow18)
    await someToken.connect(alice).approve(opinionBounties.address, pow18)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, someToken.address, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, someToken.address)
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)
  })

  it("(ETH) deposit and get bounty info", async () => {
    await opinionBounties.connect(alice).addBountiableToken(eth)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, eth, pow18, {value: ethers.utils.parseEther('1')})
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, eth)
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['depositor']).to.equal(alice.address)
  })

  it("(ETH) deposit and get bounty info with fee", async () => {
    await opinionBounties.connect(alice).addBountiableToken(eth)
    await opinionBounties.connect(alice).setBountyFees(eth, 50)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, eth, pow18, {value: ethers.utils.parseEther('1')})
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, eth)
    expect(bounty[0]['amount'].toString()).to.equal('950000000000000000')
    expect(bounty[0]['depositor']).to.equal(alice.address)
    expect(await opinionBounties.getOwnerFeesPayable(eth)).to.equal('50000000000000000')
    await opinionBounties.connect(alice).withdrawOwnerFees()
    expect(await ethers.provider.getBalance(alice.address)).to.equal('9997657013170783354277')
  })

  it("(ETH) deposit and read info of multiple bounties", async () => {
    await opinionBounties.connect(alice).addBountiableToken(eth)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, eth, pow18, {value: ethers.utils.parseEther('1')})
		await opinionBounties.connect(charlie).depositBounty(1, bob.address, charlie.address, eth, '2000000000000000000', {value: ethers.utils.parseEther('2')})
    await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, eth, '100000000000000000', {value: ethers.utils.parseEther('.1')})
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, eth)
    expect(bounty[0]['amount'].toString()).to.equal(pow18.toString())
    expect(bounty[0]['bountyID'].toString()).to.equal('1')
    expect(bounty[0]['depositor']).to.equal(alice.address)
    expect(bounty[1]['amount'].toString()).to.equal('2000000000000000000')
    expect(bounty[1]['bountyID'].toString()).to.equal('2')
    expect(bounty[1]['depositor']).to.equal(charlie.address)
    expect(bounty[2]['amount'].toString()).to.equal('100000000000000000')
    expect(bounty[2]['bountyID'].toString()).to.equal('3')
    expect(bounty[2]['depositor']).to.equal(alice.address)
    await opinionBase.connect(bob).writeOpinion(1,  98, [6], [true])
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, eth)
    const amountAlice = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, eth)
    const amountCharlie = await opinionBounties.connect(charlie).getAmountDepositedByUser(1, bob.address, charlie.address, eth)
    expect(amountPayable).to.equal('3100000000000000000')
    expect(amountAlice.toString()).to.equal('1100000000000000000')
    expect(amountCharlie.toString()).to.equal('2000000000000000000')
    await opinionBounties.connect(bob).claimBounty(1, eth)
    expect(await ethers.provider.getBalance(bob.address)).to.equal('10003093164726911660092')
  })

  it("(ETH) deposit and rescind bounty", async () => {
    await opinionBounties.connect(alice).addBountiableToken(eth)
		await opinionBounties.connect(alice).depositBounty(1, bob.address, alice.address, eth, pow18, {value: ethers.utils.parseEther('1')})
		await opinionBounties.connect(alice).rescindBounty(1, bob.address, eth, pow18)
    const bounty = await opinionBounties.connect(alice).getBountyInfo(1, bob.address, eth)
    expect(bounty.length).to.equal(0)
    const amountPayable = await opinionBounties.connect(bob).getBountyAmountPayable(1, bob.address, eth)
    const amount = await opinionBounties.connect(alice).getAmountDepositedByUser(1, bob.address, alice.address, eth)
    expect(amountPayable).to.equal('0')
    expect(amount.toString()).to.equal('0')
  })

  it("admin only add and remove bountiable token", async () => {
    await expectRevert(opinionBounties.connect(bob).addBountiableToken(eth), "only-owner")
    await expectRevert(opinionBounties.connect(bob).removeBountiableToken(eth), "only-owner")
  })

  it("cannot readd or remove token that isnt there", async () => {
    await expectRevert(opinionBounties.connect(alice).addBountiableToken(someToken.address), "token-already-added")
    await expectRevert(opinionBounties.connect(alice).removeBountiableToken(eth), "token-not-added")
  })

  it("admin only set and withdraw owner fees", async () => {
    await expectRevert(opinionBounties.connect(bob).setBountyFees(someToken.address, 0), "only-owner")
    await expectRevert(opinionBounties.connect(bob).withdrawOwnerFees(), "only-owner")
  })  
  
  it("can only set fees for valid token", async () => {
    await expectRevert(opinionBounties.connect(alice).setBountyFees(eth, 0), "invalid-token")
  })

})
