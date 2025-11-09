import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type {
	Distribution,
	ContributorRegistry,
	Vault,
	MockERC20,
} from '../typechain-types'

describe('Distribution', function () {
	let distribution: Distribution
	let contributorRegistry: ContributorRegistry
	let vault: Vault
	let mockERC20: MockERC20
	let owner: HardhatEthersSigner
	let contributor1: HardhatEthersSigner
	let contributor2: HardhatEthersSigner
	let depositor: HardhatEthersSigner

	const MONTHLY_ALLOCATION_1 = ethers.parseEther('2000')
	const MONTHLY_ALLOCATION_2 = ethers.parseEther('1500')
	const DEPOSIT_AMOUNT = ethers.parseEther('10000')
	const RESERVED_BPS = 1000n // 10%

	beforeEach(async function () {
		;[owner, contributor1, contributor2, depositor] = await ethers.getSigners()

		// Deploy Mock ERC20
		const MockERC20Factory = await ethers.getContractFactory('MockERC20')
		mockERC20 = await MockERC20Factory.deploy('Test Token', 'TEST')
		await mockERC20.waitForDeployment()

		// Mint tokens to depositor
		await mockERC20.mint(depositor.address, DEPOSIT_AMOUNT * 2n)

		// Deploy Vault
		const VaultFactory = await ethers.getContractFactory('Vault')
		vault = await VaultFactory.deploy(
			await mockERC20.getAddress(),
			'Test Vault',
			'Test Description',
			owner.address
		)
		await vault.waitForDeployment()

		// Deploy ContributorRegistry
		const ContributorRegistryFactory = await ethers.getContractFactory('ContributorRegistry')
		contributorRegistry = await ContributorRegistryFactory.deploy(owner.address)
		await contributorRegistry.waitForDeployment()

		// Add contributors (before transferring ownership)
		await contributorRegistry
			.connect(owner)
			.addContributor(
				await vault.getAddress(),
				contributor1.address,
				'John Doe',
				'Developer',
				MONTHLY_ALLOCATION_1
			)
		await contributorRegistry
			.connect(owner)
			.addContributor(
				await vault.getAddress(),
				contributor2.address,
				'Jane Doe',
				'Designer',
				MONTHLY_ALLOCATION_2
			)

		// Deploy Distribution
		const DistributionFactory = await ethers.getContractFactory('Distribution')
		distribution = await DistributionFactory.deploy(
			owner.address,
			await contributorRegistry.getAddress(),
			RESERVED_BPS
		)
		await distribution.waitForDeployment()

		// Transfer vault ownership to Distribution contract
		await vault.connect(owner).transferOwnership(await distribution.getAddress())
		
		// Transfer ContributorRegistry ownership to Distribution contract
		await contributorRegistry.connect(owner).transferOwnership(await distribution.getAddress())

		// Deposit to vault
		await mockERC20.connect(depositor).approve(await vault.getAddress(), DEPOSIT_AMOUNT)
		await vault.connect(depositor).deposit(DEPOSIT_AMOUNT, depositor.address)
	})

	describe('Deployment', function () {
		it('Should deploy with correct owner', async function () {
			expect(await distribution.owner()).to.equal(owner.address)
		})

		it('Should deploy with correct registry', async function () {
			expect(await distribution.contributorRegistry()).to.equal(
				await contributorRegistry.getAddress()
			)
		})

		it('Should deploy with correct reserved funds BPS', async function () {
			expect(await distribution.reservedFundsBps()).to.equal(RESERVED_BPS)
		})
	})

	describe('scheduleDistribution', function () {
		it('Should schedule a distribution', async function () {
			const scheduledTime = (await time.latest()) + 86400 // 1 day from now

			await expect(
				distribution
					.connect(owner)
					.scheduleDistribution(
						await vault.getAddress(),
						scheduledTime,
						0 // Proportional
					)
			)
				.to.emit(distribution, 'DistributionScheduled')
				.withArgs(1n, await vault.getAddress(), scheduledTime, 0)

			const schedule = await distribution.getSchedule(1)
			expect(schedule.vault).to.equal(await vault.getAddress())
			expect(schedule.scheduledTime).to.equal(scheduledTime)
			expect(schedule.method).to.equal(0) // Proportional
			expect(schedule.isExecuted).to.be.false
		})

		it('Should revert if non-owner tries to schedule', async function () {
			const scheduledTime = (await time.latest()) + 86400

			await expect(
				distribution
					.connect(contributor1)
					.scheduleDistribution(await vault.getAddress(), scheduledTime, 0)
			).to.be.revertedWithCustomError(distribution, 'OwnableUnauthorizedAccount')
		})

		it('Should revert with invalid vault address', async function () {
			const scheduledTime = (await time.latest()) + 86400

			await expect(
				distribution
					.connect(owner)
					.scheduleDistribution(ethers.ZeroAddress, scheduledTime, 0)
			).to.be.revertedWith('Distribution: invalid vault')
		})

		it('Should revert if scheduled time is in the past', async function () {
			const pastTime = (await time.latest()) - 86400

			await expect(
				distribution
					.connect(owner)
					.scheduleDistribution(await vault.getAddress(), pastTime, 0)
			).to.be.revertedWith('Distribution: scheduled time must be in future')
		})
	})

	describe('executeDistribution', function () {
		let scheduleId: bigint

		beforeEach(async function () {
			const scheduledTime = (await time.latest()) + 86400
			const tx = await distribution
				.connect(owner)
				.scheduleDistribution(await vault.getAddress(), scheduledTime, 0)
			const receipt = await tx.wait()
			const event = receipt?.logs.find(
				(log) => distribution.interface.parseLog(log as any)?.name === 'DistributionScheduled'
			)
			const parsedEvent = distribution.interface.parseLog(event as any)
			scheduleId = parsedEvent?.args[0] as bigint
		})

		it('Should execute proportional distribution', async function () {
			await time.increase(86401) // Move time forward

			const balanceBefore1 = await mockERC20.balanceOf(contributor1.address)
			const balanceBefore2 = await mockERC20.balanceOf(contributor2.address)

			await expect(distribution.connect(owner).executeDistribution(scheduleId))
				.to.emit(distribution, 'DistributionExecuted')
				.withArgs(
					scheduleId,
					await vault.getAddress(),
					(amount: bigint) => amount > 0n,
					(recipients: bigint) => recipients === 2n
				)

			const balanceAfter1 = await mockERC20.balanceOf(contributor1.address)
			const balanceAfter2 = await mockERC20.balanceOf(contributor2.address)

			// Check that contributors received funds
			expect(balanceAfter1).to.be.gt(balanceBefore1)
			expect(balanceAfter2).to.be.gt(balanceBefore2)

			const schedule = await distribution.getSchedule(scheduleId)
			expect(schedule.isExecuted).to.be.true
			expect(schedule.recipients.length).to.equal(2)
		})

		it('Should update contributor earnings', async function () {
			await time.increase(86401)

			await distribution.connect(owner).executeDistribution(scheduleId)

			const contributor1Data = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor1Data.totalEarned).to.be.gt(0n)
		})

		it('Should revert if already executed', async function () {
			await time.increase(86401)
			await distribution.connect(owner).executeDistribution(scheduleId)

			await expect(
				distribution.connect(owner).executeDistribution(scheduleId)
			).to.be.revertedWith('Distribution: already executed')
		})

		it('Should revert if not yet time', async function () {
			await expect(
				distribution.connect(owner).executeDistribution(scheduleId)
			).to.be.revertedWith('Distribution: not yet time')
		})

		it('Should revert if vault has no assets', async function () {
			// Withdraw all assets
			const shares = await vault.balanceOf(depositor.address)
			await vault.connect(depositor).redeem(shares, depositor.address, depositor.address)

			await time.increase(86401)

			await expect(
				distribution.connect(owner).executeDistribution(scheduleId)
			).to.be.revertedWith('Distribution: vault has no assets')
		})

		it('Should revert if no contributors', async function () {
			// Remove all contributors (Distribution is now the owner)
			// We need to impersonate the Distribution contract to call as owner
			const distributionAddress = await distribution.getAddress()
			
			// Fund the Distribution contract with ETH for gas
			await ethers.provider.send('hardhat_setBalance', [
				distributionAddress,
				'0x1000000000000000000', // 1 ETH
			])
			
			await ethers.provider.send('hardhat_impersonateAccount', [distributionAddress])
			const distributionSigner = await ethers.getSigner(distributionAddress)
			
			await contributorRegistry
				.connect(distributionSigner)
				.removeContributor(await vault.getAddress(), contributor1.address)
			await contributorRegistry
				.connect(distributionSigner)
				.removeContributor(await vault.getAddress(), contributor2.address)

			// Stop impersonating
			await ethers.provider.send('hardhat_stopImpersonatingAccount', [distributionAddress])

			await time.increase(86401)

			await expect(
				distribution.connect(owner).executeDistribution(scheduleId)
			).to.be.revertedWith('Distribution: no contributors')
		})
	})

	describe('setReservedFundsBps', function () {
		it('Should update reserved funds BPS', async function () {
			const newBps = 1500n // 15%

			await distribution.connect(owner).setReservedFundsBps(newBps)
			expect(await distribution.reservedFundsBps()).to.equal(newBps)
		})

		it('Should revert if BPS > 10000', async function () {
			await expect(
				distribution.connect(owner).setReservedFundsBps(10001n)
			).to.be.revertedWith('Distribution: bps must be <= 10000')
		})
	})

	describe('Getters', function () {
		it('Should return all schedule IDs', async function () {
			const scheduledTime1 = (await time.latest()) + 86400
			const scheduledTime2 = (await time.latest()) + 172800

			await distribution
				.connect(owner)
				.scheduleDistribution(await vault.getAddress(), scheduledTime1, 0)
			await distribution
				.connect(owner)
				.scheduleDistribution(await vault.getAddress(), scheduledTime2, 1)

			const scheduleIds = await distribution.getAllScheduleIds()
			expect(scheduleIds.length).to.equal(2)
		})
	})
})

