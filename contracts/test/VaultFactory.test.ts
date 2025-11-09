import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type { VaultFactory, Vault, MockERC20 } from '../typechain-types'

describe('VaultFactory', function () {
	let vaultFactory: VaultFactory
	let mockERC20: MockERC20
	let owner: HardhatEthersSigner
	let user1: HardhatEthersSigner
	let user2: HardhatEthersSigner

	beforeEach(async function () {
		;[owner, user1, user2] = await ethers.getSigners()

		// Deploy Mock ERC20
		const MockERC20Factory = await ethers.getContractFactory('MockERC20')
		mockERC20 = await MockERC20Factory.deploy('Test Token', 'TEST')
		await mockERC20.waitForDeployment()

		// Deploy VaultFactory
		const VaultFactoryFactory = await ethers.getContractFactory('VaultFactory')
		vaultFactory = await VaultFactoryFactory.deploy(owner.address)
		await vaultFactory.waitForDeployment()
	})

	describe('Deployment', function () {
		it('Should deploy with correct owner', async function () {
			expect(await vaultFactory.owner()).to.equal(owner.address)
		})

		it('Should start with zero vaults', async function () {
			expect(await vaultFactory.getVaultCount()).to.equal(0)
		})
	})

	describe('createVault', function () {
		it('Should create a new vault', async function () {
			const tx = await vaultFactory.connect(user1).createVault(
				await mockERC20.getAddress(),
				'Test Vault',
				'Test Description'
			)
			const receipt = await tx.wait()

			// Get vault address from event
			const event = receipt?.logs.find(
				(log) => vaultFactory.interface.parseLog(log as any)?.name === 'VaultCreated'
			)
			expect(event).to.not.be.undefined

			const parsedEvent = vaultFactory.interface.parseLog(event as any)
			const vaultAddress = parsedEvent?.args[0]

			expect(await vaultFactory.getVaultCount()).to.equal(1)
			expect(await vaultFactory.getAllVaults()).to.include(vaultAddress)
		})

		it('Should track vaults by deployer', async function () {
			await vaultFactory.connect(user1).createVault(
				await mockERC20.getAddress(),
				'Vault 1',
				'Description 1'
			)
			await vaultFactory.connect(user1).createVault(
				await mockERC20.getAddress(),
				'Vault 2',
				'Description 2'
			)
			await vaultFactory.connect(user2).createVault(
				await mockERC20.getAddress(),
				'Vault 3',
				'Description 3'
			)

			const user1Vaults = await vaultFactory.getVaultsByDeployer(user1.address)
			const user2Vaults = await vaultFactory.getVaultsByDeployer(user2.address)

			expect(user1Vaults.length).to.equal(2)
			expect(user2Vaults.length).to.equal(1)
		})

		it('Should revert with invalid asset address', async function () {
			await expect(
				vaultFactory.connect(user1).createVault(
					ethers.ZeroAddress,
					'Test Vault',
					'Test Description'
				)
			).to.be.revertedWith('VaultFactory: invalid asset address')
		})

		it('Should revert with empty name', async function () {
			await expect(
				vaultFactory.connect(user1).createVault(
					await mockERC20.getAddress(),
					'',
					'Test Description'
				)
			).to.be.revertedWith('VaultFactory: name required')
		})

		it('Should emit VaultCreated event', async function () {
			await expect(
				vaultFactory.connect(user1).createVault(
					await mockERC20.getAddress(),
					'Test Vault',
					'Test Description'
				)
			)
				.to.emit(vaultFactory, 'VaultCreated')
				.withArgs(
					(addr: string) => addr !== ethers.ZeroAddress,
					user1.address,
					'Test Vault',
					await mockERC20.getAddress()
				)
		})
	})

	describe('Getters', function () {
		beforeEach(async function () {
			await vaultFactory.connect(user1).createVault(
				await mockERC20.getAddress(),
				'Vault 1',
				'Description 1'
			)
			await vaultFactory.connect(user1).createVault(
				await mockERC20.getAddress(),
				'Vault 2',
				'Description 2'
			)
		})

		it('Should return correct vault count', async function () {
			expect(await vaultFactory.getVaultCount()).to.equal(2)
		})

		it('Should return all vaults', async function () {
			const allVaults = await vaultFactory.getAllVaults()
			expect(allVaults.length).to.equal(2)
		})

		it('Should return vaults by deployer', async function () {
			const vaults = await vaultFactory.getVaultsByDeployer(user1.address)
			expect(vaults.length).to.equal(2)
		})
	})
})

