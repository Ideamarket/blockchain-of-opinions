/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const fs = require('fs')
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { exec } = require('child_process')
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const path = require('path')

const buildDir = './res'

const allContracts = {
	avm: [
		{
			contractName: 'NFTOpinionBase',
			deployedName: 'NFTOpinionBase',
			abiPath: 'NFTOpinionBase.sol/NFTOpinionBase.json',
		},
	],
}

const networks = {
	mainnet: {
		name: 'mainnet',
		realNetworkName: 'mainnet',
		startBlock: 11830000,
	},

	'test-avm-l2': {
		name: 'test-avm-l2',
		realNetworkName: 'arbitrum-rinkeby',
		startBlock: 12564700,
	},
}

let contracts
let network

async function main() {
	let startBlock = 0
	let branch = 'master'

	for (let i = 0; i < process.argv.length; i++) {
		if (process.argv[i] === '--rinkeby') {
			network = networks.rinkeby
			contracts = allContracts.evm
		} else if (process.argv[i] === '--test') {
			network = networks.test
			contracts = allContracts.evm
		} else if (process.argv[i] === '--test-avm-l1') {
			network = networks['test-avm-l1']
			contracts = allContracts.evm
		} else if (process.argv[i] === '--test-avm-l2') {
			network = networks['test-avm-l2']
			contracts = allContracts.avm
		} else if (process.argv[i] === '--mainnet') {
			network = networks.mainnet
			contracts = allContracts.evm
		} else if (process.argv[i] === '--branch') {
			const val = process.argv[i + 1]
			if (!val || val.startsWith('$') || val.startsWith('%')) {
				continue
			}
			branch = val
		} else if (process.argv[i] === '--start-block') {
			const val = process.argv[i + 1]
			if (!val || val.startsWith('$') || val.startsWith('%')) {
				continue
			}
			startBlock = parseInt(val)
		}
	}

	console.log(`> Using network ${network.name}`)
	console.log(`> Using branch ${branch}`)
	console.log(startBlock > 0 ? `> Using startblock ${startBlock}` : `> Using hardcoded startBlock`)

	// Generate subgraph.yaml file
	process.chdir('..')
	console.log('> Generating subgraph.yaml')
	let mustacheCmd = 'mustache'
	if (process.platform === 'win32') {
		mustacheCmd += '.cmd'
	}
	executeCmd(mustacheCmd + ' res/network-config.json subgraph.template.yaml > subgraph.yaml')

	// Generate autogen files
	if (fs.existsSync('generated')) {
		deleteDirectory('generated')
	}

	if (fs.existsSync(path.join(buildDir, 'generated'))) {
		deleteDirectory(path.join(buildDir, 'generated'))
	}

	console.log('> Generating autogen files')
	let graphCmd = 'graph'
	if (process.platform === 'win32') {
		graphCmd += '.cmd'
	}
	executeCmd(graphCmd + ' codegen --output-dir ' + path.normalize(buildDir + '/generated'))
}

function deleteDirectory(dir) {
	fs.rmdirSync(dir, { recursive: true })
}

async function executeCmd(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error) => {
			if (error) {
				reject(error)
			} else {
				resolve()
			}
		})
	})
}

main()
