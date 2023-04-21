const BigNumber = require('bignumber.js');
async function deploy(name, ...params) {
	const Contract = await ethers.getContractFactory(name);
	return await Contract.deploy(...params).then((f) => f.deployed());
}

function getEvent(receipt, eventName, func) {
	const event = receipt.events.find((e) => e.event === eventName);
	if (func && event) return func(event);
	return event | null;
}
function getEvents(receipt, eventName, func) {
	const events = receipt.events.filter((e) => e.event === eventName);
	if (func && events) return events.map(func);
	return events | null;
}
async function callAndWait(tokenContract, methodName, options) {
	const { from, args, value } = options;
	const tx = await tokenContract
		.connect(from)
		[methodName](...args, { from: from.address, value: value });

	return tx.wait(1);
}
function gasCost(txReceipt) {
	const { gasUsed, effectiveGasPrice } = txReceipt;
	if (!gasUsed || !effectiveGasPrice) return 0;
	const gasCost = gasUsed.mul(effectiveGasPrice);
	return gasCost;
}
function networkDelay(interval) {
	const intervalNumber = BigNumber.isBigNumber(interval)
		? interval.toNumber()
		: interval;
	return network.provider.send('evm_increaseTime', [intervalNumber + 1]);
}

function delay(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}
function getOwners(contract, tokenIds) {
	return Promise.all(
		tokenIds.map((tokenId) => {
			return contract.ownerOf(tokenId);
		})
	);
}

function toSeconds(value, unit) {
	let duration;

	if (unit === 'seconds') {
		duration = value;
	} else if (unit === 'minutes') {
		duration = value * 60;
	} else if (unit === 'hours') {
		duration = value * 3600;
	} else if (unit === 'days') {
		duration = value * 86400;
	} else {
		throw new Error('Invalid time unit');
	}

	return duration;
}

function now() {
	return Math.floor(new Date().getTime() / 1000);
}

function formatText(...text) {
	return `——${text}——`;
}

module.exports = {
	deploy: deploy,
	delay: delay,
	getEvent: getEvent,
	getEvents: getEvents,
	callAndWait: callAndWait,
	getOwners: getOwners,
	toSeconds: toSeconds,
	now: now,
	gasCost: gasCost,
	networkDelay: networkDelay,
	formatText: formatText,
};
