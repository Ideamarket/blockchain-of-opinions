const { expectRevert, expectEvent } = require('@openzeppelin/test-helpers')
const { expect } = require('chai')
const { BigNumber } = require('ethers')
const { ethers } = require('hardhat')

describe("NFTOpinionBase", () => {

	let alice, bob, charlie
	let opinionBase
	let ideamarketPosts
    beforeEach(async () => {
        const accounts = await ethers.getSigners();
		alice = accounts[0];
		bob = accounts[1];
		charlie = accounts[2];
		const IdeamarketPosts = await ethers.getContractFactory("IdeamarketPosts");
		ideamarketPosts = await IdeamarketPosts.deploy(alice.address, "contractURI/IMPOSTS", "https://ideamarketposts/",  ethers.utils.parseEther("0.001"));
        const OpinionBase = await ethers.getContractFactory("NFTOpinionBase");
		opinionBase = await OpinionBase.deploy();
		await opinionBase.connect(alice).initialize(alice.address, ideamarketPosts.address, BigNumber.from('1000000000000000'));
		for (i = 0; i <= 15; i++) {
			await ideamarketPosts.connect(charlie).mint("hi", charlie.address,  {value: ethers.utils.parseEther("0.001")})
		}
	})

	it("should write opinion citing 0 post", async () => {
		await opinionBase.connect(alice).writeOpinion(1,  98, [1], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const opinion = await opinionBase.getOpinion(1, alice.address);
		expect(opinion[0]['citations'][0]).to.equal(0);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("should write opinion citing other post", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const opinion = await opinionBase.getOpinion(1, alice.address);
		expect(opinion[0]['citations'][0]).to.equal(2);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("should write opinion with multiple citations", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2, 3, 5, 6], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")});
		const opinion = await opinionBase.getOpinion(1,  alice.address);
		expect(opinion[0]['citations'][0]).to.equal(2);
		expect(opinion[0]['citations'].length).to.equal(4);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['inFavorArr'][3]).to.equal(false);
		expect(opinion[0]['inFavorArr'].length).to.equal(4);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
	})

	it("should fail with more than 10 citations", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, 
			[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], [true, true, true, false, true, true, true, false, true, true, true],
			alice.address, {value: ethers.utils.parseEther("0.001")}), "too many citations");
	})

	it("should fail repeat citations", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 2, 5, 6], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "repeat citation");
	})

	it("should fail if citation number is 0 ", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [0], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "invalid citation");
	})

	it("should fail if citing nonexistant post", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 17, 5, 6], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "invalid citation");
	})

	it("should fail if citations length != inFavorArr length", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 4, 5, 6], [true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "citation arr length must equal inFavorArr length");
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 4], [true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "citation arr length must equal inFavorArr length");
	})

	it("should fail if cites itself", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 1, 5, 6], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "invalid citation");
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [1], [true], alice.address, {value: ethers.utils.parseEther("0.001")}), "invalid citation");
	})

	it("should fail citing multiple citations including 0 citation", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2, 0, 5, 6], [true, true, true, false], alice.address, {value: ethers.utils.parseEther("0.001")}), "invalid citation");
	})

	it("should write and fetch users opinion", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const opinion = await opinionBase.getOpinion(1,  alice.address);
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(opinion[0]['citations'][0]).to.equal(2);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(fetchedOpinions[0]['citations'][0]).to.equal(2);
		expect(fetchedOpinions[0]['inFavorArr'][0]).to.equal(true);
		expect(fetchedOpinions[0]['tokenID']).to.equal(1);
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
	})

	it("should fetch opinion on topic", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const fetchedOpinions = await opinionBase.getOpinionsAboutNFT(1);
		expect(fetchedOpinions[0]['citations'][0]).to.equal(2);
		expect(fetchedOpinions[0]['inFavorArr'][0]).to.equal(true);
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(1);
	})

		it("should fetch opinions for an address", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(2, 48, [3], [false], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(2, 58, [4], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const fetchedOpinions = await opinionBase.getAllOpinions();
		const idList = await opinionBase.getOpinionedNFTs();
		expect(idList.length).to.equal(2);
		expect(idList[0]).to.equal(1);
		expect(idList[1]).to.equal(2);
		expect(fetchedOpinions[0]['citations'][0]).to.equal(2);
		expect(fetchedOpinions[0]['inFavorArr'][0]).to.equal(true);
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions[1]['citations'][0]).to.equal(3);
		expect(fetchedOpinions[1]['inFavorArr'][0]).to.equal(false);
		expect(fetchedOpinions[1]['rating']).to.equal(48);
		expect(fetchedOpinions[1]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(3);
	})

	it("should fetch latest opinion on topic", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const fetchedOpinions = await opinionBase.getLatestOpinionsAboutNFT(1);
		expect(fetchedOpinions[0]['citations'][0]).to.equal(2);
		expect(fetchedOpinions[0]['inFavorArr'][0]).to.equal(true);
		expect(fetchedOpinions[0]['rating']).to.equal(98);
		expect(fetchedOpinions[0]['author']).to.equal(alice.address);
		expect(fetchedOpinions.length).to.equal(1);
	})

	it("should fetch opinined tokenIDPairs", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2, 5], [true, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);
	})

	it("write and fetch multiple opinions from the same person about same token", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [3, 7, 12], [false, true, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(1, 45, [5, 6], [false, false], alice.address, {value: ethers.utils.parseEther("0.001")});

		const opinion = await opinionBase.getOpinion(1, alice.address);

		expect(opinion[0]['citations'][0]).to.equal(3);
		expect(opinion[0]['citations'].length).to.equal(3);
		expect(opinion[0]['inFavorArr'].length).to.equal(3);
		expect(opinion[0]['inFavorArr'][0]).to.equal(false);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);

		expect(opinion[1]['citations'][0]).to.equal(5);
		expect(opinion[1]['citations'].length).to.equal(2);
		expect(opinion[1]['inFavorArr'][0]).to.equal(false);
		expect(opinion[1]['rating']).to.equal(45);
		expect(opinion[1]['author']).to.equal(alice.address);
		
		const fetchedOpinions = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinions[0]["citations"][0]).to.equal(opinion[0]["citations"][0]);
		expect(fetchedOpinions[1]["citations"][0]).to.equal(opinion[1]["citations"][0]);

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(1);
		expect(opinionsAboutNFT[0]["citations"][0]).to.equal(opinion[0]["citations"][0]);
		expect(opinionsAboutNFT[1]["citations"][0]).to.equal(opinion[1]["citations"][0]);

		const latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(1);
		expect(latestOpinionsAboutNFT[0]["citations"][0]).to.equal(opinion[1]["citations"][0]);
		expect(latestOpinionsAboutNFT.length).to.equal(1);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["citations"][0]).to.equal(opinion[0]["citations"][0]);
		expect(allOpinions.length).to.equal(2);
	})

	it("write and fetch multiple opinions from the same person about different address", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [3, 7, 12], [false, true, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(2, 45, [5, 6], [false, false], alice.address, {value: ethers.utils.parseEther("0.001")});

		const opinionTokenOne = await opinionBase.getOpinion(1, alice.address);
		const opinionTokenTwo = await opinionBase.getOpinion(2, alice.address);

		expect(opinionTokenOne[0]['citations'][0]).to.equal(3);
		expect(opinionTokenOne[0]['citations'].length).to.equal(3);
		expect(opinionTokenOne[0]['inFavorArr'][0]).to.equal(false);
		expect(opinionTokenOne[0]['rating']).to.equal(98);
		expect(opinionTokenOne[0]['author']).to.equal(alice.address);

		expect(opinionTokenTwo[0]['citations'][0]).to.equal(5);
		expect(opinionTokenTwo[0]['inFavorArr'][0]).to.equal(false);
		expect(opinionTokenTwo[0]['rating']).to.equal(45);
		expect(opinionTokenTwo[0]['author']).to.equal(alice.address);
		
		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		expect(fetchedOpinionsAlice[0]["citations"][0]).to.equal(3);
		expect(fetchedOpinionsAlice[1]["citations"][0]).to.equal(5);

		const opinionsAboutNFT1 = await opinionBase.getOpinionsAboutNFT(1);
		expect(opinionsAboutNFT1[0]["citations"][0]).to.equal(3);

		const opinionsAboutNFT2 = await opinionBase.getOpinionsAboutNFT(2);
		expect(opinionsAboutNFT2[0]["citations"][0]).to.equal(5);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
        expect(opinedNFTs[0]).to.equal(1);
		expect(opinedNFTs[1]).to.equal(2);
        expect(opinedNFTs.length).to.equal(2);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["citations"][0]).to.equal(3);
		expect(allOpinions[1]["citations"][0]).to.equal(5);
		expect(allOpinions.length).to.equal(2);
	})

	it("write and fetch multiple opinions from different people about same address", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [3, 7, 12], [false, true, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(bob).writeOpinion(1, 45, [5, 6], [false, false], bob.address, {value: ethers.utils.parseEther("0.001")});

		const opinionAlice = await opinionBase.getOpinion(1,  alice.address);
		expect(opinionAlice[0]['citations'][0]).to.equal(3);
		expect(opinionAlice[0]['rating']).to.equal(98);
		expect(opinionAlice[0]['author']).to.equal(alice.address);
		
		const opinionBob = await opinionBase.getOpinion(1, bob.address);
		expect(opinionBob[0]['citations'][0]).to.equal(5);
		expect(opinionBob[0]['rating']).to.equal(45);
		expect(opinionBob[0]['author']).to.equal(bob.address);

		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		const fetchedOpinionsBob = await opinionBase.getUsersOpinions(bob.address);
		expect(fetchedOpinionsAlice[0]["citations"][0]).to.equal(3);
		expect(fetchedOpinionsBob[0]["citations"][0]).to.equal(5);

		expect(opinionAlice.length).to.equal(1);
		expect(opinionBob.length).to.equal(1);
		expect(fetchedOpinionsAlice.length).to.equal(1);
		expect(fetchedOpinionsBob.length).to.equal(1);

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(1);
		expect(opinionsAboutNFT[0]["citations"][0]).to.equal(3);
		expect(opinionsAboutNFT[1]["citations"][0]).to.equal(5);

		const latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(1);
		expect(latestOpinionsAboutNFT[0]["citations"][0]).to.equal(3);
		expect(latestOpinionsAboutNFT[1]["citations"][0]).to.equal(5);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
        expect(opinedNFTs[0]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["citations"][0]).to.equal(3);
		expect(allOpinions[1]["citations"][0]).to.equal(5);
		expect(allOpinions.length).to.equal(2);

		const tokenIDs = await opinionBase.getOpinionedNFTs();
		expect(tokenIDs.length).to.equal(1);
		expect(tokenIDs[0]).to.equal(1);

	})

	it("integration test", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [3, 7, 12], [false, true, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(1, 42, [4, 5], [false, true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(bob).writeOpinion(1, 45, [5, 6], [false, false], bob.address, {value: ethers.utils.parseEther("0.001")});
		
		const opinionAlice = await opinionBase.getOpinion(1, alice.address);
		expect(opinionAlice[0]['citations'][0]).to.equal(3);
		expect(opinionAlice[0]['rating']).to.equal(98);
		expect(opinionAlice[0]['author']).to.equal(alice.address);
		expect(opinionAlice[1]['citations'][0]).to.equal(4);

		const opinionBob = await opinionBase.getOpinion(1, bob.address);
		expect(opinionBob[0]['citations'][0]).to.equal(5);
		expect(opinionBob[0]['rating']).to.equal(45);
		expect(opinionBob[0]['author']).to.equal(bob.address);

		const fetchedOpinionsAlice = await opinionBase.getUsersOpinions(alice.address);
		const fetchedOpinionsBob = await opinionBase.getUsersOpinions(bob.address);
		expect(fetchedOpinionsAlice[0]["citations"][0]).to.equal(3);
		expect(fetchedOpinionsAlice[1]["citations"][0]).to.equal(4);
		expect(fetchedOpinionsBob[0]["citations"][0]).to.equal(5);

		expect(opinionAlice.length).to.equal(2);
		expect(opinionBob.length).to.equal(1);
		
		expect(fetchedOpinionsAlice.length).to.equal(2);
		expect(fetchedOpinionsBob.length).to.equal(1);

		const opinionsAboutNFT = await opinionBase.getOpinionsAboutNFT(1);
		expect(opinionsAboutNFT[0]["citations"][0]).to.equal(3);
		expect(opinionsAboutNFT[1]["citations"][0]).to.equal(4);
		expect(opinionsAboutNFT[2]["citations"][0]).to.equal(5);

		let latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(1);
		expect(latestOpinionsAboutNFT[0]["citations"][0]).to.equal(4);
		expect(latestOpinionsAboutNFT[1]["citations"][0]).to.equal(5);
		expect(latestOpinionsAboutNFT.length).to.equal(2);

		const opinedNFTs = await opinionBase.getOpinionedNFTs();
		expect(opinedNFTs[0]).to.equal(1);
		expect(opinedNFTs.length).to.equal(1);

		const allOpinions = await opinionBase.getAllOpinions();
		expect(allOpinions[0]["citations"][0]).to.equal(3);
		expect(allOpinions[1]["citations"][0]).to.equal(4);
		expect(allOpinions[2]["citations"][0]).to.equal(5);
		expect(allOpinions.length).to.equal(3);

		await opinionBase.connect(alice).writeOpinion(1, 20, [11], [false], alice.address, {value: ethers.utils.parseEther("0.001")});

		latestOpinionsAboutNFT = await opinionBase.getLatestOpinionsAboutNFT(1);
		expect(latestOpinionsAboutNFT[0]["citations"][0]).to.equal(11);
		expect(latestOpinionsAboutNFT[1]["citations"][0]).to.equal(5);
		expect(latestOpinionsAboutNFT.length).to.equal(2);
	})

	it("emmited event should be correct", async () => {
		expect(await opinionBase.connect(alice).writeOpinion(1,  98, [3, 7, 12], [false, true, true], alice.address, {value: ethers.utils.parseEther("0.001")})).
		to.emit(opinionBase, "OpinionWritten").withArgs(alice.address, 1,  98, [3, 7, 12], [false, true, true], alice.address);
	})

	it("should revert if no fee payment", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address), "invalid fee");
	})
	
	it("should revert if incorrect fee payment", async () => {
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.01")}), "invalid fee");
		await expectRevert(opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.0001")}), "invalid fee");
	})

	it("withdraw works", async () => {
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(alice).writeOpinion(1, 98, [2], [true], alice.address, {value: ethers.utils.parseEther("0.001")});
		await opinionBase.connect(bob).writeOpinion(1, 98, [2], [true], bob.address, {value: ethers.utils.parseEther("0.001")});
		let balanceBefore = await ethers.provider.getBalance(charlie.address);
		let claimableFees = await opinionBase.claimableFees(charlie.address);
		expect(claimableFees).to.equal(ethers.utils.parseEther("0.003"));
		await opinionBase.connect(charlie).withdrawClaimableFees();
		let balanceAfter = await ethers.provider.getBalance(charlie.address);
		balanceBefore = await ethers.provider.getBalance(charlie.address);
		claimableFees = await opinionBase.claimableFees(charlie.address);
		expect(claimableFees).to.equal(ethers.utils.parseEther("0"));
		claimableFees = await opinionBase.claimableFees(alice.address);
		expect(claimableFees).to.equal(ethers.utils.parseEther("0"));
		claimableFees = await opinionBase.claimableFees(bob.address);
		expect(claimableFees).to.equal(ethers.utils.parseEther("0"));
	})

	it("change fee", async () => {
		await opinionBase.connect(alice).changeFeePrice(ethers.utils.parseEther("0.01"));  
		await opinionBase.connect(alice).writeOpinion(1,  98, [1], [true], alice.address, {value: ethers.utils.parseEther("0.01")});
		const opinion = await opinionBase.getOpinion(1, alice.address);
		expect(opinion[0]['citations'][0]).to.equal(0);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})

	it("pause fees", async () => {
		await opinionBase.connect(alice).flipFeeSwitch();
		await opinionBase.connect(alice).writeOpinion(1,  98, [1], [true], alice.address);
		const opinion = await opinionBase.getOpinion(1, alice.address);
		expect(opinion[0]['citations'][0]).to.equal(0);
		expect(opinion[0]['inFavorArr'][0]).to.equal(true);
		expect(opinion[0]['tokenID']).to.equal(1);
		expect(opinion[0]['rating']).to.equal(98);
		expect(opinion[0]['author']).to.equal(alice.address);
		expect(opinion.length).to.equal(1);
	})
	
})
