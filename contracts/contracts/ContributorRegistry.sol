// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';
import { ReentrancyGuard } from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title ContributorRegistry
 * @notice Registry for managing contributors and their allocations per vault
 */
contract ContributorRegistry is Ownable, ReentrancyGuard {
	/// @notice Contributor information
	struct Contributor {
		string name;
		string role;
		address wallet;
		uint256 monthlyAllocation; // in wei/smallest unit
		uint256 totalEarned;
		uint256 joinDate;
		bool isActive;
	}

	/// @notice Mapping from vault address to contributor wallet to contributor info
	mapping(address => mapping(address => Contributor)) public contributors;

	/// @notice Mapping from vault address to array of contributor wallets
	mapping(address => address[]) public vaultContributors;

	/// @notice Mapping from vault address to total contributors count
	mapping(address => uint256) public vaultContributorCount;

	/// @notice Events
	event ContributorAdded(
		address indexed vault,
		address indexed wallet,
		string name,
		string role,
		uint256 monthlyAllocation
	);
	event ContributorUpdated(address indexed vault, address indexed wallet, uint256 newAllocation);
	event ContributorRemoved(address indexed vault, address indexed wallet);
	event ContributorEarningsUpdated(address indexed vault, address indexed wallet, uint256 amount);

	/**
	 * @notice Initialize the registry
	 * @param owner Owner address
	 */
	constructor(address owner) Ownable(owner) {}

	/**
	 * @notice Add a contributor to a vault
	 * @param vault Vault address
	 * @param wallet Contributor wallet address
	 * @param name Contributor name
	 * @param role Contributor role
	 * @param monthlyAllocation Monthly allocation amount
	 */
	function addContributor(
		address vault,
		address wallet,
		string memory name,
		string memory role,
		uint256 monthlyAllocation
	) external onlyOwner {
		require(vault != address(0), 'ContributorRegistry: invalid vault');
		require(wallet != address(0), 'ContributorRegistry: invalid wallet');
		require(bytes(name).length > 0, 'ContributorRegistry: name required');
		require(monthlyAllocation > 0, 'ContributorRegistry: allocation must be > 0');

		Contributor storage contributor = contributors[vault][wallet];
		require(!contributor.isActive, 'ContributorRegistry: contributor already exists');

		contributor.name = name;
		contributor.role = role;
		contributor.wallet = wallet;
		contributor.monthlyAllocation = monthlyAllocation;
		contributor.totalEarned = 0;
		contributor.joinDate = block.timestamp;
		contributor.isActive = true;

		vaultContributors[vault].push(wallet);
		vaultContributorCount[vault]++;

		emit ContributorAdded(vault, wallet, name, role, monthlyAllocation);
	}

	/**
	 * @notice Update contributor allocation
	 * @param vault Vault address
	 * @param wallet Contributor wallet address
	 * @param newAllocation New monthly allocation
	 */
	function updateContributorAllocation(address vault, address wallet, uint256 newAllocation) external onlyOwner {
		require(vault != address(0), 'ContributorRegistry: invalid vault');
		require(wallet != address(0), 'ContributorRegistry: invalid wallet');
		require(newAllocation > 0, 'ContributorRegistry: allocation must be > 0');

		Contributor storage contributor = contributors[vault][wallet];
		require(contributor.isActive, 'ContributorRegistry: contributor not found');

		contributor.monthlyAllocation = newAllocation;

		emit ContributorUpdated(vault, wallet, newAllocation);
	}

	/**
	 * @notice Remove a contributor from a vault
	 * @param vault Vault address
	 * @param wallet Contributor wallet address
	 */
	function removeContributor(address vault, address wallet) external onlyOwner {
		require(vault != address(0), 'ContributorRegistry: invalid vault');
		require(wallet != address(0), 'ContributorRegistry: invalid wallet');

		Contributor storage contributor = contributors[vault][wallet];
		require(contributor.isActive, 'ContributorRegistry: contributor not found');

		contributor.isActive = false;

		// Remove from array (swap with last and pop)
		address[] storage contributorsList = vaultContributors[vault];
		for (uint256 i = 0; i < contributorsList.length; i++) {
			if (contributorsList[i] == wallet) {
				contributorsList[i] = contributorsList[contributorsList.length - 1];
				contributorsList.pop();
				vaultContributorCount[vault]--;
				break;
			}
		}

		emit ContributorRemoved(vault, wallet);
	}

	/**
	 * @notice Update contributor earnings
	 * @param vault Vault address
	 * @param wallet Contributor wallet address
	 * @param amount Amount earned
	 */
	function updateEarnings(address vault, address wallet, uint256 amount) external onlyOwner {
		require(vault != address(0), 'ContributorRegistry: invalid vault');
		require(wallet != address(0), 'ContributorRegistry: invalid wallet');

		Contributor storage contributor = contributors[vault][wallet];
		require(contributor.isActive, 'ContributorRegistry: contributor not found');

		contributor.totalEarned += amount;

		emit ContributorEarningsUpdated(vault, wallet, amount);
	}

	/**
	 * @notice Get contributor information
	 * @param vault Vault address
	 * @param wallet Contributor wallet address
	 * @return contributor Contributor struct
	 */
	function getContributor(address vault, address wallet) external view returns (Contributor memory contributor) {
		return contributors[vault][wallet];
	}

	/**
	 * @notice Get all contributors for a vault
	 * @param vault Vault address
	 * @return wallets Array of contributor wallets
	 * @return contributorData Array of contributor structs
	 */
	function getVaultContributors(
		address vault
	) external view returns (address[] memory wallets, Contributor[] memory contributorData) {
		address[] memory contributorWallets = vaultContributors[vault];
		Contributor[] memory data = new Contributor[](contributorWallets.length);

		for (uint256 i = 0; i < contributorWallets.length; i++) {
			data[i] = contributors[vault][contributorWallets[i]];
		}

		return (contributorWallets, data);
	}

	/**
	 * @notice Get total monthly allocation for a vault
	 * @param vault Vault address
	 * @return total Total monthly allocation
	 */
	function getTotalMonthlyAllocation(address vault) external view returns (uint256 total) {
		address[] memory contributorWallets = vaultContributors[vault];
		uint256 sum = 0;

		for (uint256 i = 0; i < contributorWallets.length; i++) {
			Contributor memory contributor = contributors[vault][contributorWallets[i]];
			if (contributor.isActive) {
				sum += contributor.monthlyAllocation;
			}
		}

		return sum;
	}
}

