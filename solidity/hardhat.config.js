const envFile = process.env.SOL_NODE_ENV
	? `.env.${process.env.SOL_NODE_ENV}`
	: '.env.example';

require('hardhat-gas-reporter');
require('dotenv').config({ path: envFile });
require('hardhat-deploy');
require('solidity-coverage');
require('@nomiclabs/hardhat-etherscan');
// require('@nomiclabs/hardhat-upgrades');
require('@nomicfoundation/hardhat-chai-matchers');

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {
			chainId: 31337,
			// gasPrice: 130000000000,
		},
		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [PRIVATE_KEY],
			chainId: 5,
			blockConfirmations: 6,
		},
	},
	solidity: {
		compilers: [
			{
				version: '0.8.19',
			},
		],
	},
	etherscan: {
		apiKey: ETHERSCAN_API_KEY,
		customChains: [],
	},
	gasReporter: {
		enabled: true,
		currency: 'USD',
		outputFile: 'gas-report.txt',
		noColors: true,
		coinmarketcap: COINMARKETCAP_API_KEY,
	},
	namedAccounts: {
		deployer: {
			default: 0,
		},
		player: {
			default: 1,
		},
	},
};
