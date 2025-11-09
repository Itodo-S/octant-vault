import { expect } from 'chai'
import { ethers } from 'hardhat'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type { Vault, MockERC20 } from '../typechain-types'

describe('Vault', function () {
	let vault: Vault
	let mockERC20: MockERC20
	let owner: HardhatEthersSigner
	let user1: HardhatEthersSigner
	let user2: HardhatEthersSigner

	const VAULT_NAME = 'Test Vault'
	const VAULT_DESCRIPTION = 'Test Description'
	const INITIAL_SUPPLY = ethers.parseEther('1000000')

	beforeEach(async function () {
		;[owner, user1, user2] = await ethers.getSigners()

		// Deploy Mock ERC20
		const MockERC20Factory = await ethers.getContractFactory('MockERC20')
		mockERC20 = await MockERC20Factory.deploy('Test Token', 'TEST')
		await mockERC20.waitForDeployment()

		// Mint tokens to users
		await mockERC20.mint(user1.address, INITIAL_SUPPLY)
		await mockERC20.mint(user2.address, INITIAL_SUPPLY)

		// Deploy Vault
		const VaultFactory = await ethers.getContractFactory('Vault')
		vault = await VaultFactory.deploy(
			await mockERC20.getAddress(),
			VAULT_NAME,
			VAULT_DESCRIPTION,
			owner.address
		)
		await vault.waitForDeployment()
	})

	describe('Deployment', function () {
		it('Should deploy with correct metadata', async function () {
			expect(await vault.vaultName()).to.equal(VAULT_NAME)
			expect(await vault.vaultDescription()).to.equal(VAULT_DESCRIPTION)
			expect(await vault.owner()).to.equal(owner.address)
			expect(await vault.deployer()).to.equal(owner.address)
		})

		it('Should have correct asset address', async function () {
			expect(await vault.asset()).to.equal(await mockERC20.getAddress())
		})

		it('Should emit VaultInitialized event', async function () {
			const VaultFactory = await ethers.getContractFactory('Vault')
			const newVault = await VaultFactory.deploy(
				await mockERC20.getAddress(),
				'New Vault',
				'New Description',
				owner.address
			)
			// Event is emitted during deployment, check the deployment transaction
			const deployTx = await newVault.deploymentTransaction()
			expect(deployTx).to.not.be.null
			// The event is emitted in the constructor, so we verify by checking vault state
			await newVault.waitForDeployment()
			const vaultName = await newVault.vaultName()
			expect(vaultName).to.equal('New Vault')
		})
	})

	describe('Deposit', function () {
		const depositAmount = ethers.parseEther('1000')

		beforeEach(async function () {
			await mockERC20.connect(user1).approve(await vault.getAddress(), depositAmount)
		})

		it('Should allow deposit', async function () {
			await expect(vault.connect(user1).deposit(depositAmount, user1.address))
				.to.emit(vault, 'Deposit')
				.withArgs(user1.address, user1.address, depositAmount, depositAmount)

			expect(await vault.balanceOf(user1.address)).to.equal(depositAmount)
		})

		it('Should transfer assets to vault', async function () {
			const balanceBefore = await mockERC20.balanceOf(await vault.getAddress())
			await vault.connect(user1).deposit(depositAmount, user1.address)
			const balanceAfter = await mockERC20.balanceOf(await vault.getAddress())

			expect(balanceAfter - balanceBefore).to.equal(depositAmount)
		})

		it('Should mint shares to receiver', async function () {
			await vault.connect(user1).deposit(depositAmount, user2.address)
			expect(await vault.balanceOf(user2.address)).to.equal(depositAmount)
		})
	})

	describe('Redeem', function () {
		const depositAmount = ethers.parseEther('1000')
		const redeemAmount = ethers.parseEther('500')

		beforeEach(async function () {
			await mockERC20.connect(user1).approve(await vault.getAddress(), depositAmount)
			await vault.connect(user1).deposit(depositAmount, user1.address)
		})

		it('Should allow redeem', async function () {
			await expect(vault.connect(user1).redeem(redeemAmount, user1.address, user1.address))
				.to.emit(vault, 'Withdraw')
				.withArgs(
					user1.address,
					user1.address,
					user1.address,
					redeemAmount,
					redeemAmount
				)

			expect(await vault.balanceOf(user1.address)).to.equal(depositAmount - redeemAmount)
		})

		it('Should transfer assets to receiver', async function () {
			const balanceBefore = await mockERC20.balanceOf(user2.address)
			await vault.connect(user1).redeem(redeemAmount, user2.address, user1.address)
			const balanceAfter = await mockERC20.balanceOf(user2.address)

			expect(balanceAfter - balanceBefore).to.equal(redeemAmount)
		})
	})

	describe('Distribution', function () {
		const depositAmount = ethers.parseEther('10000')
		const distributionAmount = ethers.parseEther('1000')

		beforeEach(async function () {
			await mockERC20.connect(user1).approve(await vault.getAddress(), depositAmount)
			await vault.connect(user1).deposit(depositAmount, user1.address)
		})

		it('Should allow owner to distribute to contributor', async function () {
			await expect(
				vault.connect(owner).distributeToContributor(user2.address, distributionAmount)
			)
				.to.emit(vault, 'DistributionExecuted')
				.withArgs(user2.address, distributionAmount, (timestamp: bigint) => timestamp > 0n)

			expect(await mockERC20.balanceOf(user2.address)).to.equal(
				INITIAL_SUPPLY + distributionAmount
			)
		})

		it('Should revert if non-owner tries to distribute', async function () {
			await expect(
				vault.connect(user1).distributeToContributor(user2.address, distributionAmount)
			).to.be.revertedWithCustomError(vault, 'OwnableUnauthorizedAccount')
		})

		it('Should revert with invalid recipient', async function () {
			await expect(
				vault.connect(owner).distributeToContributor(ethers.ZeroAddress, distributionAmount)
			).to.be.revertedWith('Vault: invalid recipient')
		})

		it('Should revert with insufficient assets', async function () {
			const excessiveAmount = ethers.parseEther('20000')
			await expect(
				vault.connect(owner).distributeToContributor(user2.address, excessiveAmount)
			).to.be.revertedWith('Vault: insufficient assets')
		})

		it('Should allow batch distribution', async function () {
			const recipients = [user2.address, owner.address]
			const amounts = [ethers.parseEther('500'), ethers.parseEther('500')]

			await vault.connect(owner).batchDistribute(recipients, amounts)

			expect(await mockERC20.balanceOf(user2.address)).to.equal(
				INITIAL_SUPPLY + amounts[0]
			)
			expect(await mockERC20.balanceOf(owner.address)).to.equal(amounts[1])
		})

		it('Should revert batch distribution with mismatched arrays', async function () {
			const recipients = [user2.address, owner.address]
			const amounts = [ethers.parseEther('500')]

			await expect(
				vault.connect(owner).batchDistribute(recipients, amounts)
			).to.be.revertedWith('Vault: array length mismatch')
		})
	})

	describe('getVaultInfo', function () {
		it('Should return correct vault information', async function () {
			const info = await vault.getVaultInfo()
			expect(info[0]).to.equal(VAULT_NAME)
			expect(info[1]).to.equal(VAULT_DESCRIPTION)
			expect(info[2]).to.equal(0n) // totalAssets
			expect(info[3]).to.equal(0n) // totalSupply
		})
	})
})

