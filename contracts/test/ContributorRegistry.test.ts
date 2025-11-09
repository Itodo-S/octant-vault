import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type { ContributorRegistry, Vault, MockERC20 } from '../typechain-types'

describe('ContributorRegistry', function () {
	let contributorRegistry: ContributorRegistry
	let vault: Vault
	let mockERC20: MockERC20
	let owner: HardhatEthersSigner
	let contributor1: HardhatEthersSigner
	let contributor2: HardhatEthersSigner

	const MONTHLY_ALLOCATION_1 = ethers.parseEther('2000')
	const MONTHLY_ALLOCATION_2 = ethers.parseEther('1500')

	beforeEach(async function () {
		;[owner, contributor1, contributor2] = await ethers.getSigners()

		// Deploy Mock ERC20
		const MockERC20Factory = await ethers.getContractFactory('MockERC20')
		mockERC20 = await MockERC20Factory.deploy('Test Token', 'TEST')
		await mockERC20.waitForDeployment()

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
	})

	describe('Deployment', function () {
		it('Should deploy with correct owner', async function () {
			expect(await contributorRegistry.owner()).to.equal(owner.address)
		})
	})

	describe('addContributor', function () {
		it('Should add a contributor', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.addContributor(
						await vault.getAddress(),
						contributor1.address,
						'John Doe',
						'Developer',
						MONTHLY_ALLOCATION_1
					)
			)
				.to.emit(contributorRegistry, 'ContributorAdded')
				.withArgs(
					await vault.getAddress(),
					contributor1.address,
					'John Doe',
					'Developer',
					MONTHLY_ALLOCATION_1
				)

			const contributor = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor.name).to.equal('John Doe')
			expect(contributor.role).to.equal('Developer')
			expect(contributor.wallet).to.equal(contributor1.address)
			expect(contributor.monthlyAllocation).to.equal(MONTHLY_ALLOCATION_1)
			expect(contributor.isActive).to.be.true
		})

		it('Should revert if non-owner tries to add', async function () {
			await expect(
				contributorRegistry
					.connect(contributor1)
					.addContributor(
						await vault.getAddress(),
						contributor1.address,
						'John Doe',
						'Developer',
						MONTHLY_ALLOCATION_1
					)
			).to.be.revertedWithCustomError(contributorRegistry, 'OwnableUnauthorizedAccount')
		})

		it('Should revert with invalid vault address', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.addContributor(
						ethers.ZeroAddress,
						contributor1.address,
						'John Doe',
						'Developer',
						MONTHLY_ALLOCATION_1
					)
			).to.be.revertedWith('ContributorRegistry: invalid vault')
		})

		it('Should revert with invalid wallet address', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.addContributor(
						await vault.getAddress(),
						ethers.ZeroAddress,
						'John Doe',
						'Developer',
						MONTHLY_ALLOCATION_1
					)
			).to.be.revertedWith('ContributorRegistry: invalid wallet')
		})

		it('Should revert with empty name', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.addContributor(
						await vault.getAddress(),
						contributor1.address,
						'',
						'Developer',
						MONTHLY_ALLOCATION_1
					)
			).to.be.revertedWith('ContributorRegistry: name required')
		})

		it('Should revert if contributor already exists', async function () {
			await contributorRegistry
				.connect(owner)
				.addContributor(
					await vault.getAddress(),
					contributor1.address,
					'John Doe',
					'Developer',
					MONTHLY_ALLOCATION_1
				)

			await expect(
				contributorRegistry
					.connect(owner)
					.addContributor(
						await vault.getAddress(),
						contributor1.address,
						'Jane Doe',
						'Designer',
						MONTHLY_ALLOCATION_2
					)
			).to.be.revertedWith('ContributorRegistry: contributor already exists')
		})
	})

	describe('updateContributorAllocation', function () {
		const newAllocation = ethers.parseEther('3000')

		beforeEach(async function () {
			await contributorRegistry
				.connect(owner)
				.addContributor(
					await vault.getAddress(),
					contributor1.address,
					'John Doe',
					'Developer',
					MONTHLY_ALLOCATION_1
				)
		})

		it('Should update contributor allocation', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.updateContributorAllocation(
						await vault.getAddress(),
						contributor1.address,
						newAllocation
					)
			)
				.to.emit(contributorRegistry, 'ContributorUpdated')
				.withArgs(await vault.getAddress(), contributor1.address, newAllocation)

			const contributor = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor.monthlyAllocation).to.equal(newAllocation)
		})

		it('Should revert if contributor not found', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.updateContributorAllocation(
						await vault.getAddress(),
						contributor2.address,
						newAllocation
					)
			).to.be.revertedWith('ContributorRegistry: contributor not found')
		})
	})

	describe('removeContributor', function () {
		beforeEach(async function () {
			await contributorRegistry
				.connect(owner)
				.addContributor(
					await vault.getAddress(),
					contributor1.address,
					'John Doe',
					'Developer',
					MONTHLY_ALLOCATION_1
				)
		})

		it('Should remove a contributor', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.removeContributor(await vault.getAddress(), contributor1.address)
			)
				.to.emit(contributorRegistry, 'ContributorRemoved')
				.withArgs(await vault.getAddress(), contributor1.address)

			const contributor = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor.isActive).to.be.false
		})
	})

	describe('updateEarnings', function () {
		const earnings = ethers.parseEther('5000')

		beforeEach(async function () {
			await contributorRegistry
				.connect(owner)
				.addContributor(
					await vault.getAddress(),
					contributor1.address,
					'John Doe',
					'Developer',
					MONTHLY_ALLOCATION_1
				)
		})

		it('Should update contributor earnings', async function () {
			await expect(
				contributorRegistry
					.connect(owner)
					.updateEarnings(await vault.getAddress(), contributor1.address, earnings)
			)
				.to.emit(contributorRegistry, 'ContributorEarningsUpdated')
				.withArgs(await vault.getAddress(), contributor1.address, earnings)

			const contributor = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor.totalEarned).to.equal(earnings)
		})

		it('Should accumulate earnings', async function () {
			await contributorRegistry
				.connect(owner)
				.updateEarnings(await vault.getAddress(), contributor1.address, earnings)
			await contributorRegistry
				.connect(owner)
				.updateEarnings(await vault.getAddress(), contributor1.address, earnings)

			const contributor = await contributorRegistry.getContributor(
				await vault.getAddress(),
				contributor1.address
			)
			expect(contributor.totalEarned).to.equal(earnings * 2n)
		})
	})

	describe('getVaultContributors', function () {
		beforeEach(async function () {
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
		})

		it('Should return all contributors for a vault', async function () {
			const [wallets, contributors] = await contributorRegistry.getVaultContributors(
				await vault.getAddress()
			)

			expect(wallets.length).to.equal(2)
			expect(contributors.length).to.equal(2)
			expect(wallets).to.include(contributor1.address)
			expect(wallets).to.include(contributor2.address)
		})
	})

	describe('getTotalMonthlyAllocation', function () {
		beforeEach(async function () {
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
		})

		it('Should return total monthly allocation', async function () {
			const total = await contributorRegistry.getTotalMonthlyAllocation(
				await vault.getAddress()
			)
			expect(total).to.equal(MONTHLY_ALLOCATION_1 + MONTHLY_ALLOCATION_2)
		})

		it('Should exclude inactive contributors', async function () {
			await contributorRegistry
				.connect(owner)
				.removeContributor(await vault.getAddress(), contributor1.address)

			const total = await contributorRegistry.getTotalMonthlyAllocation(
				await vault.getAddress()
			)
			expect(total).to.equal(MONTHLY_ALLOCATION_2)
		})
	})
})

