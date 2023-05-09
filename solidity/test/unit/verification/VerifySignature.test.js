const { assert, expect } = require('chai');
const { developmentChains } = require('../../../helper-hardhat-config.js');
const { ethers } = require('hardhat');

!developmentChains.includes(network.name)
	? describe.skip
	: describe('VerifySignature', async () => {
			let VerifySignature;
			beforeEach(async function () {
				[owner, signer1, signer2, signer3] = await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['VerifySignature']);

				VerifySignature = await ethers.getContract(
					'VerifySignature',
					deployer
				);
			});

			it('signature verificator', async () => {
				const message = '123';

				const hash = ethers.utils.solidityKeccak256(
					['string'],
					[message]
				);
				const signature = await signer1.signMessage(
					ethers.utils.arrayify(hash)
				);

				const verified = await VerifySignature.connect(signer1).verify(
					message,
					signature
				);
				assert.isTrue(verified);
			});
	  });
