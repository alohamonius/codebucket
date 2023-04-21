const { assert, expect } = require('chai');
const { delay, toSeconds } = require('../../utils/helper');
describe('utils', async () => {
	it('toSeconds', async () => {
		const duration1 = toSeconds(10, 'seconds');
		await delay(1000);
		const duration2 = toSeconds(10, 'seconds');
		assert(duration1 === duration2);
	});
});
