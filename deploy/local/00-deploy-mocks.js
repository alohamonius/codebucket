const { ethers } = require('hardhat');
const {
	developmentChains,
	DECIMALS,
	INITIAL_AMSWER,
} = require('../../helper-hardhat-config');

const BASE_FEE = ethers.utils.parseEther('0.25');
const GAS_PRICE_LINK = 1e9;

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	const { owner } = await ethers.getSigners();
	log('------DEPLOYMENT STARTED----------');

	if (developmentChains.includes(network.name)) {
		log('Local network, deploying mocks');
		await deploy('MockV3Aggregator', {
			contract: 'MockV3Aggregator',
			from: deployer,
			log: true,
			args: [DECIMALS, INITIAL_AMSWER],
		});
		await deploy('VRFCoordinatorV2Mock', {
			contract: 'VRFCoordinatorV2Mock',
			from: deployer,
			log: true,
			args: [BASE_FEE, GAS_PRICE_LINK],
		});

		await deploy('MockWETH', {
			contract: 'MockWETH',
			from: deployer,
			log: true,
			args: [deployer],
		});

		log('-------Mock deployed---------');
	} else {
		log('------Mocks skipped------');
	}
};

module.exports.tags = ['all', 'mocks'];
