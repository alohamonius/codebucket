const { assert, expect } = require('chai');
const BigNumber = require('bignumber.js');
BigNumber.config({ DECIMAL_PLACES: 19 });
const { toSeconds, getEvent, callAndWait } = require('../../../utils/helper');
const {
	developmentChains,
	networkConfig,
} = require('../../../helper-hardhat-config.js');
const { ethers } = require('hardhat');

const ERC20ABI = require('@uniswap/v2-core/build/ERC20.json').abi;
!developmentChains.includes(network.name)
	? describe.skip
	: describe('TokenWrapper', async () => {
			let TokenWrapper, deployer;
			const usdc = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
			const vitalikAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';

			const some = '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919';
			const USDC = new ethers.Contract(usdc, ERC20ABI, ethers.provider);

			const SOME_ERC20 = new ethers.Contract(
				some,
				ERC20ABI,
				ethers.provider
			);
			beforeEach(async function () {
				[owner, filledSigner, signerWithUsdt, signer3] =
					await ethers.getSigners();
				deployer = (await getNamedAccounts()).deployer;
				await deployments.fixture(['TokenWrapper']);

				TokenWrapper = await ethers.getContract(
					'TokenWrapper',
					deployer
				);

				await hre.network.provider.request({
					method: 'hardhat_impersonateAccount',
					params: [vitalikAddress],
				});

				const impersonateSigner = await ethers.getSigner(
					vitalikAddress
				);
				const balance = await SOME_ERC20.balanceOf(vitalikAddress);

				await SOME_ERC20.connect(impersonateSigner)
					.transfer(
						signerWithUsdt.address,
						balance.div(50).toString(),
						{
							gasLimit: 1000000, // set gas limit here
						}
					)
					.then((tx) => tx.wait());
			});

			it('wrap+burn fee should correct calculated', async () => {
				const balanceBefore = await SOME_ERC20.balanceOf(
					signerWithUsdt.address
				);
				const ownerUsdcBalanceBefore = await USDC.balanceOf(
					owner.address
				);

				await SOME_ERC20.connect(signerWithUsdt)
					.approve(TokenWrapper.address, ethers.constants.MaxUint256)
					.then((tx) => tx.wait());

				await TokenWrapper.connect(owner).setAllowedTokens([some]);

				const wrapReceipt = await TokenWrapper.connect(signerWithUsdt)
					.wrap([
						{
							tokenAddress: some,
							amount: balanceBefore,
						},
					])
					.then((tx) => tx.wait());

				const tokenId = getEvent(
					wrapReceipt,
					'NFTMinted',
					(data) => data.args.tokenId
				);

				await TokenWrapper.connect(signerWithUsdt).burn(tokenId);
				const userBalanceAfterBurn = new BigNumber(
					(
						await SOME_ERC20.balanceOf(signerWithUsdt.address)
					).toString()
				);

				await TokenWrapper.connect(owner)
					.withdraw()
					.then((tx) => tx.wait());

				const ownerUsdcBalanceAfterWithdraw = await USDC.balanceOf(
					owner.address
				);
				assert(
					ownerUsdcBalanceBefore < ownerUsdcBalanceAfterWithdraw,
					'not converted to usdc'
				);
				assert(
					!ownerUsdcBalanceAfterWithdraw.eq(0),
					'owner usdc balance  zero'
				);
				assert(
					new BigNumber(balanceBefore.toString())
						.times(0.995)
						.dp(0)
						.eq(userBalanceAfterBurn),
					'wrong fee calculated'
				);
			});
	  });
