const { assert, expect } = require('chai');
const { delay, toSeconds, getEvent } = require('../../../utils/helper');
const { ethers, upgrades } = require('hardhat');
describe('Proxy', async () => {
	let ProxyV1, ProxyV2;
	let proxyV1, proxyV2;
	beforeEach(async () => {
		proxyV1 = await ethers.getContractFactory('ProxyTestV1');
		proxyV2 = await ethers.getContractFactory('ProxyTestV2');
		//ProxyTestV1,ProxyTestV2
		ProxyV1 = await upgrades.deployProxy(proxyV1, [], {
			initializer: false,
		});
		await ProxyV1.deployed();
	});
	it('contract v1 upgraded with new logic, but safe storage', async () => {
		await ProxyV1.square(1).then((c) => c.wait());
		const valueV1 = getEvent(
			await ProxyV1.square(11).then((c) => c.wait()),
			'Calculated',
			(data) => data.args.value
		);

		const lastValueV1 = await ProxyV1.getLastCalculatedSquare();

		ProxyV2 = await upgrades.upgradeProxy(ProxyV1.address, proxyV2);
		const lastValueV2 = await ProxyV2.getLastCalculatedSquare();

		assert.isTrue(lastValueV2.eq(lastValueV1));
		assert.isTrue(lastValueV1.eq(valueV1));
		assert.equal(ProxyV2.address, ProxyV1.address);
	});
});
