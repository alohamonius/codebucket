const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../helper-hardhat-config');
const { formatText } = require('../utils/helper');

const DEPLOY_NAME = 'VerifySignature';

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));

	if (developmentChains.includes(network.name)) {
		[owner, addr1, addr2, addr3, addr4] = await ethers.getSigners();

		const market = await deploy('VerifySignature', {
			contract: 'VerifySignature',
			from: deployer,
			log: true,
			args: [],
		});
	} else {
	}
};

module.exports.tags = ['all', 'VerifySignature'];
