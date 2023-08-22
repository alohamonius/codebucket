const envFile = process.env.CODEBUCKET_ENV
	? `.env.${process.env.CODEBUCKET_ENV}`
	: '.env.example';

require('hardhat-gas-reporter');
require('dotenv').config({ path: envFile });
require('hardhat-deploy');
require('solidity-coverage');
require('@nomiclabs/hardhat-etherscan');
require('@nomicfoundation/hardhat-chai-matchers');
require('@openzeppelin/hardhat-upgrades');

const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;
const GOERLI_DEPLOYER = process.env.GOERLI_DEPLOYER;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const MATIC_RPC_URL = process.env.MATIC_RPC_URL;
const MATIC_DEPLOYER = process.env.MATIC_DEPLOYER;

module.exports = {
	defaultNetwork: 'hardhat',
	networks: {
		hardhat: {
			chainId: 31337,
		},
		forkETH: {
			url: 'https://eth-mainnet.public.blastapi.io',
			chainId: 31339,
			forking: {
				url: 'https://eth-mainnet.public.blastapi.io',
				blockNumber: 17192000,
			},
			blockConfirmations: 1,
		},
		matic: {
			url: MATIC_RPC_URL,
			accounts: [MATIC_DEPLOYER],
			chainId: 137,
			blockConfirmations: 6,
		},

		goerli: {
			url: GOERLI_RPC_URL,
			accounts: [GOERLI_DEPLOYER],
			chainId: 5,
			blockConfirmations: 6,
			deploy: ['deploy/goerli/'],
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
