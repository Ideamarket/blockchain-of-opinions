const fs = require('fs')
const readline = require('readline')

const BN = require('bignumber.js')

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
})

module.exports.read = async function (question) {
	return await new Promise((resolve) => {
		rl.question(question, (answer) => {
			return resolve(answer)
		})
	})
}

module.exports.loadDeployedAddress = function (network, contract) {
	const path = 'deployed/deployed-' + network + '.json'
	const raw = fs.readFileSync(path)
	const addresses = JSON.parse(raw)
	return addresses[contract]
}

module.exports.loadABI = function (artifact) {
	const raw = fs.readFileSync('build/contracts/' + artifact + '.json')
	const rawJson = JSON.parse(raw)
	return rawJson.abi
}

module.exports.getFunctionABI = function (fullABI, searchFunction) {
	for (let i = 0; i < fullABI.length; i++) {
		const maybeFunction = fullABI[i]
		if (maybeFunction.type === 'function' && maybeFunction.name === searchFunction) {
			return maybeFunction
		}
	}

	throw 'not found: ' + searchFunction
}

module.exports.loadDeployedAddress = function (network, contract) {
	const path = 'deployed/deployed-' + network + '.json'
	if (!fs.existsSync(path)) {
		throw new Error('Deployed file does not exist')
	}

	const raw = fs.readFileSync(path)
	const addresses = JSON.parse(raw)

	if (!addresses || !addresses[contract]) {
		throw new Error(`Address for contract ${contract} does not exist`)
	}

	return addresses[contract]
}

module.exports.saveDeployedAddress = function (network, contract, address) {
	let addresses = {}
	const path = 'deployed/deployed-' + network + '.json'
	if (fs.existsSync(path)) {
		const raw = fs.readFileSync(path)
		addresses = JSON.parse(raw)
	}

	addresses[contract] = address
	fs.writeFileSync(path, JSON.stringify(addresses, undefined, 4))
}

module.exports.saveDeployedABI = function (network, contract, abi) {
	let abis = {}
	const path = 'deployed/abis-' + network + '.json'
	if (fs.existsSync(path)) {
		const raw = fs.readFileSync(path)
		abis = JSON.parse(raw)
	}

	abis[contract] = abi
	fs.writeFileSync(path, JSON.stringify(abis))
}
