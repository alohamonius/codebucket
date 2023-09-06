const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
	forkChains,
} = require('../../helper-hardhat-config');
const { formatText } = require('../../utils/helper');

const DEPLOY_NAME = 'TokenWrapper';

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));

	if (
		developmentChains.includes(network.name) ||
		forkChains.includes(network.name)
	) {
		await deploy('TokenWrapper', {
			contract: 'TokenWrapper',
			from: deployer,
			log: true,
			args: ['nft20', 'nft20'],
		});
	} else {
	}
};

module.exports.tags = ['all', 'TokenWrapper'];
