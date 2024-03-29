const { run, ethers, artifacts } = require('hardhat')
const { BigNumber } = require('ethers')

const { read, loadDeployedAddress, saveDeployedAddress, saveDeployedABI } = require('./shared')

const allDeploymentParams = {
	'avm': {
		timelockDelay: '86400', // 24 hours
		gasPrice: 7500000000,
	},
	'rinkeby-avm': {
		timelockDelay: '1',
		gasPrice: 10000000000, // 10 gwei
		tokenFeePercentage: BigNumber.from('0'),
		feeSwitch: false

	},
}
const allExternalContractAddresses = {
	'avm': {
		multisig: '0x1Cc33A0ae55C250F66B8f9A1a3094bF285A9083f',
		ideamarketPosts: '0x41AE86f5F6889102c17322aac603DE6f7F3E03D7'
	},
	'rinkeby-avm': {
		multisig: '0x4e6a11b687F35fA21D92731F9CD2f231C61f9151',
		ideamarketPosts: '0x1EAb68548F5ca15D874166522BBa6B724b03A534',
		nftOpinionBase: '0x7f40ec20DB16F8573706f81732DcE76893b455c8',
		imoAddress: '0x634a0900a5F90C9F2d42BF1d49d94B84Db0A260d',

	},
}

let deploymentParams
let externalContractAddresses

async function main() {
	const deployerAccount = (await ethers.getSigners())[0]
	const deployerAddress = deployerAccount.address
	console.log(`Deploying from ${deployerAddress}`)

	await run('compile')
	console.log('')

	let networkName = (await ethers.provider.getNetwork()).name
    if (networkName == 'arbitrum') {
		console.log('Using avm')
		networkName = 'avm'
		deploymentParams = allDeploymentParams['avm']
		externalContractAddresses = allExternalContractAddresses['avm']
	} else {
		// if network is not one of the above, manually input data here
		console.log('rinkeby-avm')
		networkName = 'rinkeby-avm'
		deploymentParams = allDeploymentParams['rinkeby-avm']
		externalContractAddresses = allExternalContractAddresses['rinkeby-avm']
	}

	console.log('Block', await ethers.provider.getBlockNumber())

	const STAGE = 3

	let dsPauseProxyAddress
	if (STAGE <= 1) {
		console.log('1. Deploy Timelock')
		console.log('==============================================')
		const dsPause = await deployContract(
			'DSPause',
			deploymentParams.timelockDelay,
			externalContractAddresses.multisig
		)
		dsPauseProxyAddress = await dsPause._proxy()
		saveDeployedAddress(networkName, 'dsPause', dsPause.address)
		saveDeployedABI(networkName, 'dsPause', artifacts.readArtifactSync('DSPause').abi)
		saveDeployedAddress(networkName, 'dsPauseProxy', dsPauseProxyAddress)
		saveDeployedABI(networkName, 'dsPauseProxy', artifacts.readArtifactSync('DSPauseProxy').abi)
		console.log('')
	} else {
		dsPauseProxyAddress = loadDeployedAddress(networkName, 'dsPauseProxy')
	}

	let proxyAdminAddress
	if (STAGE <= 2) {
		console.log('2. Deploy ProxyAdmin')
		console.log('==============================================')
		proxyAdminAddress = (await deployContract('ProxyAdmin', dsPauseProxyAddress)).address
		saveDeployedAddress(networkName, 'proxyAdmin', proxyAdminAddress)
		saveDeployedABI(networkName, 'proxyAdmin', artifacts.readArtifactSync('ProxyAdmin').abi)
		console.log('')
	} else {
		proxyAdminAddress = loadDeployedAddress(networkName, 'proxyAdmin')
	}

	let contractName = await read('contract name: ')
	if (contractName ==='AddressOpinionBounties' || contractName ==='NFTOpinionBounties') {
		console.log('deploy ' + contractName)
		console.log('==============================================')

		const [proxyContract, contract] = await deployProxyContract(
			contractName,
			proxyAdminAddress,
			externalContractAddresses.multisig,
			externalContractAddresses.nftOpinionBase,
			[externalContractAddresses.imoAddress],
			[deploymentParams.tokenFeePercentage],
			deploymentParams.feeSwitch
		)
		proxyContractAddress = proxyContract.address
		saveDeployedAddress(networkName, contractName, proxyContractAddress)
		saveDeployedABI(networkName, contractName, artifacts.readArtifactSync(contractName).abi)
		saveDeployedAddress(networkName, contractName + "Logic", contract.address)
		console.log('')
	} else {
		console.log('deploy ' + contractName)
		console.log('==============================================')
		const [proxyContract, contract] = await deployProxyContract(
			contractName,
			proxyAdminAddress,
			externalContractAddresses.multisig,
			externalContractAddresses.ideamarketPosts,
			ethers.utils.parseEther(".001")
		)

		proxyContractAddress = proxyContract.address
		saveDeployedAddress(networkName, contractName, proxyContractAddress)
		saveDeployedABI(networkName, contractName, artifacts.readArtifactSync(contractName).abi)
		saveDeployedAddress(networkName, contractName + "Logic", contract.address)
		console.log('')
	}
}

async function deployProxyContract(name, admin, ...params) {
	const logic = await deployContract(name)
	let data;
	if (params.length > 0) {
		data = logic.interface.encodeFunctionData('initialize', [...params])
	} else {
		data = "0x"
	}
	const proxy = await deployContract('AdminUpgradeabilityProxy', logic.address, admin, data)

	return [proxy, logic]
}

async function deployContract(name, ...params) {
	console.log(`Deploying contract ${name}`)
	const contractFactory = await ethers.getContractFactory(name)
	console.log("hi")
	const deployed = await contractFactory.deploy(...params, { gasPrice: deploymentParams.gasPrice })
	await deployed.deployed()

	return deployed
}


main()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
