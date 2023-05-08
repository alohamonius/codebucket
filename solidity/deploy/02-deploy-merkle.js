const { network } = require('hardhat');
const { generateMerkleTree } = require('../utils/merkleUtils');
module.exports = async (hre) => {
	const { getNamedAccounts, deployments } = hre;
	const { deploy, log, get } = deployments;
	const { deployer } = await getNamedAccounts();
	const chainId = network.config.chainId;
	const signers = await ethers.getSigners();
	const merkleTree = generateMerkleTree(signers.map((c) => c.address));
	const rootHex = merkleTree.getHexRoot();
	// const merkle = await deploy('Merkle', {
	// 	from: deployer,
	// 	args: [rootHex],
	// 	log: true,
	// 	waitConfirmations: 1,
	// });
	log('-------Merkle deployed---------');
};

module.exports.tags = ['merkle'];
