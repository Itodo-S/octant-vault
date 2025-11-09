import { expect } from 'chai'
import { ethers } from 'hardhat'
import { time } from '@nomicfoundation/hardhat-network-helpers'
import type { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers'
import type { QuadraticVoting, Vault, MockERC20 } from '../typechain-types'

describe('QuadraticVoting', function () {
	let quadraticVoting: QuadraticVoting
	let vault: Vault
	let mockERC20: MockERC20
	let owner: HardhatEthersSigner
	let voter1: HardhatEthersSigner
	let voter2: HardhatEthersSigner
	let nominee: HardhatEthersSigner

	const VOTING_DURATION = 7 * 24 * 60 * 60 // 7 days

	beforeEach(async function () {
		;[owner, voter1, voter2, nominee] = await ethers.getSigners()

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

		// Deploy QuadraticVoting
		const QuadraticVotingFactory = await ethers.getContractFactory('QuadraticVoting')
		quadraticVoting = await QuadraticVotingFactory.deploy(owner.address, ethers.ZeroAddress)
		await quadraticVoting.waitForDeployment()
	})

	describe('Deployment', function () {
		it('Should deploy with correct owner', async function () {
			expect(await quadraticVoting.owner()).to.equal(owner.address)
		})

		it('Should start with zero votings', async function () {
			const votingIds = await quadraticVoting.getAllVotingIds()
			expect(votingIds.length).to.equal(0)
		})
	})

	describe('createVoting', function () {
		it('Should create a new voting', async function () {
			const endTime = (await time.latest()) + VOTING_DURATION

			await expect(
				quadraticVoting
					.connect(owner)
					.createVoting(
						await vault.getAddress(),
						nominee.address,
						'John Doe',
						'Developer',
						'Great contributor',
						VOTING_DURATION
					)
			)
				.to.emit(quadraticVoting, 'VotingCreated')
				.withArgs(
					1n,
					await vault.getAddress(),
					nominee.address,
					'John Doe',
					(endTime: bigint) => endTime > 0n
				)

			const voting = await quadraticVoting.getVoting(1)
			expect(voting.vault).to.equal(await vault.getAddress())
			expect(voting.nominee).to.equal(nominee.address)
			expect(voting.nomineeName).to.equal('John Doe')
			expect(voting.isActive).to.be.true
		})

		it('Should revert if non-owner tries to create', async function () {
			await expect(
				quadraticVoting
					.connect(voter1)
					.createVoting(
						await vault.getAddress(),
						nominee.address,
						'John Doe',
						'Developer',
						'Description',
						VOTING_DURATION
					)
			).to.be.revertedWithCustomError(quadraticVoting, 'OwnableUnauthorizedAccount')
		})

		it('Should revert with invalid vault address', async function () {
			await expect(
				quadraticVoting
					.connect(owner)
					.createVoting(
						ethers.ZeroAddress,
						nominee.address,
						'John Doe',
						'Developer',
						'Description',
						VOTING_DURATION
					)
			).to.be.revertedWith('QuadraticVoting: invalid vault')
		})

		it('Should revert with invalid nominee address', async function () {
			await expect(
				quadraticVoting
					.connect(owner)
					.createVoting(
						await vault.getAddress(),
						ethers.ZeroAddress,
						'John Doe',
						'Developer',
						'Description',
						VOTING_DURATION
					)
			).to.be.revertedWith('QuadraticVoting: invalid nominee')
		})

		it('Should revert with empty name', async function () {
			await expect(
				quadraticVoting
					.connect(owner)
					.createVoting(
						await vault.getAddress(),
						nominee.address,
						'',
						'Developer',
						'Description',
						VOTING_DURATION
					)
			).to.be.revertedWith('QuadraticVoting: name required')
		})
	})

	describe('vote', function () {
		let votingId: bigint

		beforeEach(async function () {
			const tx = await quadraticVoting
				.connect(owner)
				.createVoting(
					await vault.getAddress(),
					nominee.address,
					'John Doe',
					'Developer',
					'Description',
					VOTING_DURATION
				)
			const receipt = await tx.wait()
			const event = receipt?.logs.find(
				(log) => quadraticVoting.interface.parseLog(log as any)?.name === 'VotingCreated'
			)
			const parsedEvent = quadraticVoting.interface.parseLog(event as any)
			votingId = parsedEvent?.args[0] as bigint
		})

		it('Should allow voting', async function () {
			const voteCount = 3n
			const cost = voteCount * voteCount

			await expect(
				quadraticVoting.connect(voter1).vote(votingId, voteCount, true, { value: cost })
			)
				.to.emit(quadraticVoting, 'VoteCast')
				.withArgs(votingId, voter1.address, voteCount, true, cost)

			const voting = await quadraticVoting.getVoting(votingId)
			expect(voting.votesFor).to.equal(voteCount)
		})

		it('Should calculate quadratic cost correctly', async function () {
			const voteCount = 5n
			const cost = await quadraticVoting.calculateVoteCost(voteCount)
			expect(cost).to.equal(voteCount * voteCount)
		})

		it('Should revert with insufficient payment', async function () {
			const voteCount = 3n
			const cost = voteCount * voteCount

			await expect(
				quadraticVoting.connect(voter1).vote(votingId, voteCount, true, { value: cost - 1n })
			).to.be.revertedWith('QuadraticVoting: insufficient payment')
		})

		it('Should revert if voting not active', async function () {
			await time.increase(VOTING_DURATION + 1)
			await quadraticVoting.connect(owner).endVoting(votingId)

			const voteCount = 3n
			const cost = voteCount * voteCount

			await expect(
				quadraticVoting.connect(voter1).vote(votingId, voteCount, true, { value: cost })
			).to.be.revertedWith('QuadraticVoting: voting not active')
		})

		it('Should revert if voting ended', async function () {
			await time.increase(VOTING_DURATION + 1)

			const voteCount = 3n
			const cost = voteCount * voteCount

			await expect(
				quadraticVoting.connect(voter1).vote(votingId, voteCount, true, { value: cost })
			).to.be.revertedWith('QuadraticVoting: voting ended')
		})

		it('Should allow changing vote', async function () {
			const voteCount1 = 2n
			const cost1 = voteCount1 * voteCount1

			await quadraticVoting.connect(voter1).vote(votingId, voteCount1, true, { value: cost1 })

			const voteCount2 = 4n
			const cost2 = voteCount2 * voteCount2
			const additionalCost = cost2 - cost1

			await quadraticVoting
				.connect(voter1)
				.vote(votingId, voteCount2, false, { value: additionalCost })

			const voting = await quadraticVoting.getVoting(votingId)
			expect(voting.votesAgainst).to.equal(voteCount2)
			expect(voting.votesFor).to.equal(0n)
		})

		it('Should revert with zero votes', async function () {
			await expect(
				quadraticVoting.connect(voter1).vote(votingId, 0, true, { value: 0 })
			).to.be.revertedWith('QuadraticVoting: votes must be > 0')
		})

		it('Should revert with more than 10 votes', async function () {
			await expect(
				quadraticVoting.connect(voter1).vote(votingId, 11, true, { value: 121 })
			).to.be.revertedWith('QuadraticVoting: max 10 votes per user')
		})
	})

	describe('endVoting', function () {
		let votingId: bigint

		beforeEach(async function () {
			const tx = await quadraticVoting
				.connect(owner)
				.createVoting(
					await vault.getAddress(),
					nominee.address,
					'John Doe',
					'Developer',
					'Description',
					VOTING_DURATION
				)
			const receipt = await tx.wait()
			const event = receipt?.logs.find(
				(log) => quadraticVoting.interface.parseLog(log as any)?.name === 'VotingCreated'
			)
			const parsedEvent = quadraticVoting.interface.parseLog(event as any)
			votingId = parsedEvent?.args[0] as bigint
		})

		it('Should end voting and approve if votes for > votes against', async function () {
			await quadraticVoting.connect(voter1).vote(votingId, 5, true, { value: 25 })
			await quadraticVoting.connect(voter2).vote(votingId, 2, false, { value: 4 })

			await time.increase(VOTING_DURATION + 1)

			await expect(quadraticVoting.connect(owner).endVoting(votingId))
				.to.emit(quadraticVoting, 'VotingEnded')
				.withArgs(votingId, true, 5n, 2n)

			const voting = await quadraticVoting.getVoting(votingId)
			expect(voting.isActive).to.be.false
			expect(voting.isApproved).to.be.true
		})

		it('Should end voting and reject if votes against > votes for', async function () {
			await quadraticVoting.connect(voter1).vote(votingId, 2, true, { value: 4 })
			await quadraticVoting.connect(voter2).vote(votingId, 5, false, { value: 25 })

			await time.increase(VOTING_DURATION + 1)

			await expect(quadraticVoting.connect(owner).endVoting(votingId))
				.to.emit(quadraticVoting, 'VotingEnded')
				.withArgs(votingId, false, 2n, 5n)

			const voting = await quadraticVoting.getVoting(votingId)
			expect(voting.isActive).to.be.false
			expect(voting.isApproved).to.be.false
		})

		it('Should revert if voting not ended', async function () {
			await expect(quadraticVoting.connect(owner).endVoting(votingId)).to.be.revertedWith(
				'QuadraticVoting: voting not ended'
			)
		})
	})

	describe('Getters', function () {
		let votingId: bigint

		beforeEach(async function () {
			const tx = await quadraticVoting
				.connect(owner)
				.createVoting(
					await vault.getAddress(),
					nominee.address,
					'John Doe',
					'Developer',
					'Description',
					VOTING_DURATION
				)
			const receipt = await tx.wait()
			const event = receipt?.logs.find(
				(log) => quadraticVoting.interface.parseLog(log as any)?.name === 'VotingCreated'
			)
			const parsedEvent = quadraticVoting.interface.parseLog(event as any)
			votingId = parsedEvent?.args[0] as bigint

			await quadraticVoting.connect(voter1).vote(votingId, 3, true, { value: 9 })
		})

		it('Should return user vote', async function () {
			const userVote = await quadraticVoting.getUserVote(votingId, voter1.address)
			expect(userVote.voter).to.equal(voter1.address)
			expect(userVote.votes).to.equal(3n)
			expect(userVote.isFor).to.be.true
		})

		it('Should return all votes', async function () {
			const votes = await quadraticVoting.getVotes(votingId)
			expect(votes.length).to.equal(1)
			expect(votes[0].voter).to.equal(voter1.address)
		})

		it('Should return all voting IDs', async function () {
			const votingIds = await quadraticVoting.getAllVotingIds()
			expect(votingIds.length).to.equal(1)
			expect(votingIds[0]).to.equal(votingId)
		})
	})
})

