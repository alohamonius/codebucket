const { network } = require('hardhat');
const {
	networkConfig,
	developmentChains,
} = require('../helper-hardhat-config');
const { verify } = require('../utils/verify');
const { crowdFunding } = require('../utils/constant');
module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;

	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();

	const chainId = network.config.chainId;

	const ethUsdPriceFeedAddress = developmentChains.includes(network.name)
		? (await deployments.get('MockV3Aggregator')).address
		: networkConfig[chainId][crowdFunding].ethUsdPriceFeed;

	const args = [ethUsdPriceFeedAddress];
	const contract = await deploy(crowdFunding, {
		from: deployer,
		args: args,
		log: true,
		waitConfirmations: network.config.blockConfirmations || 1,
	});

	if (
		!developmentChains.includes(network.name) &&
		process.env.ETHERSCAN_API_KEY
	) {
		await verify(contract.address, args);
	}

	log(`${crowdFunding} deployed`);
};

module.exports.tags = ['all', 'crowd'];
