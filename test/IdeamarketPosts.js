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
        ideamarketPosts = await IdeamarketPosts.deploy(alice.address);
        await ideamarketPosts.deployed();
    })

    it("should mint post", async () => {
        await ideamarketPosts.connect(alice).mint("I love ideamarket!", [], "", 
            false, false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('I love ideamarket!');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(false);
        expect(post['isWeb2URL']).to.deep.equal(false);
        expect(post['web2Content']).to.deep.equal('');
    })

    it("should mint url post", async () => {
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", [], "", 
            true, false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(true);
        expect(post['isWeb2URL']).to.deep.equal(false);
        expect(post['web2Content']).to.deep.equal('');
    })

    it("should mint web2 post", async () => {
        await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", [], "", 
            true, true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['minter']).to.deep.equal(alice.address);
        expect(post['content']).to.deep.equal('https://twitter.com/boreasrex/status/1515005721993224195');
        expect(post['categories'].length).to.deep.equal(0);
        expect(post['imageLink']).to.deep.equal('');
        expect(post['isURL']).to.deep.equal(true);
        expect(post['isWeb2URL']).to.deep.equal(true);
        expect(post['web2Content']).to.deep.equal('kinda worried that 8 eth for my milady is too cheap..');
    })

    it("should be able add and use a category tag", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A'], "", 
            true, false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(1);
        expect(post['categories'][0]).to.deep.equal('A');
    })

    it("should be able add and use multiple categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", ['A', 'B'], "", 
            true, false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        expect(post['categories'].length).to.deep.equal(2);
        expect(post['categories'][0]).to.deep.equal('A');
        expect(post['categories'][1]).to.deep.equal('B');
    })

    it("should only be able to tag with valid categories", async () => {
        await ideamarketPosts.connect(alice).addCategories(['A', 'B', 'C']);
        await ideamarketPosts.connect(alice).mint("https://mirror.xyz/charlemagnefang.eth/m3fUfJUS1DqsmIdPTpxLaoD-DLxR_aIyjOr2udcKGdY", [""], "", 
            true, false, "", alice.address);
        const post = await ideamarketPosts.getPost(1);
        console.log(post['categories'])
        expect(post['categories'].length).to.deep.equal(0);
    })

    it("tokenURI should work without categories", async () => {
        const tx = await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", [], "", 
            true, true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + alice.address.toLowerCase() + "'," +
        "'content': 'https://twitter.com/boreasrex/status/1515005721993224195'," +
        "'image': '','categories': '[]','isURL': '1','isWeb2URL': '1','web2Content': 'kinda worried that 8 eth for my milady is too cheap..'," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        console.log(expectedURI)
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI should work with categories", async () => {
        const tx = await ideamarketPosts.connect(alice).mint("https://twitter.com/boreasrex/status/1515005721993224195", [""], "", 
            true, true, "kinda worried that 8 eth for my milady is too cheap..", alice.address);
        const uri = await ideamarketPosts.tokenURI(1);
        const aliceAddress = alice.address.toLowerCase()
        const expectedURI = "data:application/json;base64," + Buffer.from("{'minter': '" + aliceAddress + "'," +
        "'content': 'https://twitter.com/boreasrex/status/1515005721993224195'," +
        "'image': '','categories': '[]','isURL': '1','isWeb2URL': '1','web2Content': 'kinda worried that 8 eth for my milady is too cheap..'," +
        "'blockHeight': '" + tx['blockNumber'] + "'}").toString( "base64");
        console.log(expectedURI)
        expect(uri).to.deep.equal(expectedURI);
    })

    it("tokenURI data should work with multiple categories", async () => {

    })
})
	