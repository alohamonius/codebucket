const { network, ethers } = require('hardhat');
const {
	developmentChains,
	networkConfig,
} = require('../../helper-hardhat-config');
const { formatText } = require('../../utils/helper');

const DEPLOY_NAME = 'ProxyTest';

module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log } = deployments;
	const { deployer } = await getNamedAccounts();
	log(formatText(DEPLOY_NAME + ' STARTED'));

	if (developmentChains.includes(network.name)) {
		const proxy = await ethers.getContractFactory('ProxyTestV1');
		Proxy = await upgrades.deployProxy(proxy, [], {
			initializer: false,
		});
		await Proxy.deployed();
	} else {
		// const proxy = await ethers.getContractFactory('ProxyTest');
		// Proxy = await upgrades.deployProxy(proxy, [], {
		// 	initializer: false,
		// });
		// await Proxy.deployed();
	}
};

module.exports.tags = ['all', 'ProxyTest'];
