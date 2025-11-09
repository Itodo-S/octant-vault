// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Vault } from './Vault.sol';
import { ContributorRegistry } from './ContributorRegistry.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title Distribution
 * @notice Automated yield distribution to contributors
 */
contract Distribution is Ownable, ReentrancyGuard {
	/// @notice Distribution schedule information
	struct DistributionSchedule {
		address vault;
		uint256 scheduledTime;
		uint256 distributionAmount;
		address[] recipients;
		uint256[] amounts;
		DistributionMethod method;
		bool isExecuted;
		uint256 executionTime;
		bytes32 txHash;
	}

	/// @notice Distribution methods
	enum DistributionMethod {
		Proportional, // Proportional to monthly allocation
		Equal, // Equal split
		VotingWeighted // Weighted by voting results
	}

	/// @notice Mapping from schedule ID to distribution schedule
	mapping(uint256 => DistributionSchedule) public schedules;

	/// @notice Array of all schedule IDs
	uint256[] public scheduleIds;

	/// @notice Current schedule ID counter
	uint256 public nextScheduleId;

	/// @notice Contributor registry contract
	ContributorRegistry public contributorRegistry;

	/// @notice Reserved funds percentage (in basis points, e.g., 1000 = 10%)
	uint256 public reservedFundsBps;

	/// @notice Events
	event DistributionScheduled(
		uint256 indexed scheduleId,
		address indexed vault,
		uint256 scheduledTime,
		DistributionMethod method
	);
	event DistributionExecuted(
		uint256 indexed scheduleId,
		address indexed vault,
		uint256 totalAmount,
		uint256 recipientCount
	);

	/**
	 * @notice Initialize the distribution contract
	 * @param owner Owner address
	 * @param registry Contributor registry address
	 * @param reservedBps Reserved funds percentage in basis points
	 */
	constructor(address owner, address registry, uint256 reservedBps) Ownable(owner) {
		contributorRegistry = ContributorRegistry(registry);
		reservedFundsBps = reservedBps;
		nextScheduleId = 1;
	}

	/**
	 * @notice Schedule a distribution
	 * @param vault Vault address
	 * @param scheduledTime Timestamp when distribution should execute
	 * @param method Distribution method
	 * @return scheduleId The created schedule ID
	 */
	function scheduleDistribution(
		address vault,
		uint256 scheduledTime,
		DistributionMethod method
	) external onlyOwner returns (uint256 scheduleId) {
		require(vault != address(0), 'Distribution: invalid vault');
		require(scheduledTime > block.timestamp, 'Distribution: scheduled time must be in future');

		scheduleId = nextScheduleId++;

		schedules[scheduleId] = DistributionSchedule({
			vault: vault,
			scheduledTime: scheduledTime,
			distributionAmount: 0,
			recipients: new address[](0),
			amounts: new uint256[](0),
			method: method,
			isExecuted: false,
			executionTime: 0,
			txHash: bytes32(0)
		});

		scheduleIds.push(scheduleId);

		emit DistributionScheduled(scheduleId, vault, scheduledTime, method);

		return scheduleId;
	}

	/**
	 * @notice Execute a scheduled distribution
	 * @param scheduleId Schedule ID
	 */
	function executeDistribution(uint256 scheduleId) external nonReentrant {
		DistributionSchedule storage schedule = schedules[scheduleId];
		require(!schedule.isExecuted, 'Distribution: already executed');
		require(block.timestamp >= schedule.scheduledTime, 'Distribution: not yet time');

		Vault vault = Vault(schedule.vault);
		uint256 vaultBalance = vault.totalAssets();

		require(vaultBalance > 0, 'Distribution: vault has no assets');

		// Calculate distribution amount (minus reserved funds)
		uint256 reservedAmount = (vaultBalance * reservedFundsBps) / 10000;
		uint256 distributionAmount = vaultBalance - reservedAmount;

		// Get contributors
		(address[] memory wallets, ContributorRegistry.Contributor[] memory contributors) = contributorRegistry
			.getVaultContributors(schedule.vault);

		require(wallets.length > 0, 'Distribution: no contributors');

		address[] memory recipients = new address[](wallets.length);
		uint256[] memory amounts = new uint256[](wallets.length);

		// Calculate distribution based on method
		if (schedule.method == DistributionMethod.Proportional) {
			uint256 totalAllocation = contributorRegistry.getTotalMonthlyAllocation(schedule.vault);
			require(totalAllocation > 0, 'Distribution: no allocations');

			for (uint256 i = 0; i < wallets.length; i++) {
				if (contributors[i].isActive) {
					recipients[i] = wallets[i];
					amounts[i] = (distributionAmount * contributors[i].monthlyAllocation) / totalAllocation;
				}
			}
		} else if (schedule.method == DistributionMethod.Equal) {
			uint256 activeCount = 0;
			for (uint256 i = 0; i < wallets.length; i++) {
				if (contributors[i].isActive) {
					activeCount++;
				}
			}

			uint256 perRecipient = distributionAmount / activeCount;

			uint256 idx = 0;
			for (uint256 i = 0; i < wallets.length; i++) {
				if (contributors[i].isActive) {
					recipients[idx] = wallets[i];
					amounts[idx] = perRecipient;
					idx++;
				}
			}
		} else {
			// VotingWeighted - simplified equal for now
			// In production, integrate with QuadraticVoting contract
			uint256 activeCount = 0;
			for (uint256 i = 0; i < wallets.length; i++) {
				if (contributors[i].isActive) {
					activeCount++;
				}
			}

			uint256 perRecipient = distributionAmount / activeCount;

			uint256 idx = 0;
			for (uint256 i = 0; i < wallets.length; i++) {
				if (contributors[i].isActive) {
					recipients[idx] = wallets[i];
					amounts[idx] = perRecipient;
					idx++;
				}
			}
		}

		// Execute batch distribution
		vault.batchDistribute(recipients, amounts);

		// Update schedule
		schedule.distributionAmount = distributionAmount;
		schedule.recipients = recipients;
		schedule.amounts = amounts;
		schedule.isExecuted = true;
		schedule.executionTime = block.timestamp;
		schedule.txHash = keccak256(abi.encodePacked(block.timestamp, scheduleId));

		// Update earnings in registry
		for (uint256 i = 0; i < recipients.length; i++) {
			if (amounts[i] > 0) {
				contributorRegistry.updateEarnings(schedule.vault, recipients[i], amounts[i]);
			}
		}

		emit DistributionExecuted(scheduleId, schedule.vault, distributionAmount, recipients.length);
	}

	/**
	 * @notice Get distribution schedule
	 * @param scheduleId Schedule ID
	 * @return schedule Distribution schedule struct
	 */
	function getSchedule(uint256 scheduleId) external view returns (DistributionSchedule memory schedule) {
		return schedules[scheduleId];
	}

	/**
	 * @notice Get all schedule IDs
	 * @return ids Array of schedule IDs
	 */
	function getAllScheduleIds() external view returns (uint256[] memory ids) {
		return scheduleIds;
	}

	/**
	 * @notice Update reserved funds percentage
	 * @param newBps New percentage in basis points
	 */
	function setReservedFundsBps(uint256 newBps) external onlyOwner {
		require(newBps <= 10000, 'Distribution: bps must be <= 10000');
		reservedFundsBps = newBps;
	}
}

