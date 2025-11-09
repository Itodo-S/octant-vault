// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Vault } from './Vault.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title VaultFactory
 * @notice Factory contract for deploying new ERC-4626 vaults
 */
contract VaultFactory is Ownable {
	/// @notice Array of all deployed vaults
	address[] public vaults;

	/// @notice Mapping from deployer to their vaults
	mapping(address => address[]) public vaultsByDeployer;

	/// @notice Events
	event VaultCreated(address indexed vault, address indexed deployer, string name, address asset);

	/**
	 * @notice Initialize the factory
	 * @param owner Owner address
	 */
	constructor(address owner) Ownable(owner) {}

	/**
	 * @notice Create a new vault
	 * @param asset The underlying asset token address
	 * @param name Vault name
	 * @param description Vault description
	 * @return vaultAddress Address of the newly created vault
	 */
	function createVault(
		address asset,
		string memory name,
		string memory description
	) external returns (address vaultAddress) {
		require(asset != address(0), 'VaultFactory: invalid asset address');
		require(bytes(name).length > 0, 'VaultFactory: name required');

		Vault vault = new Vault(IERC20(asset), name, description, msg.sender);

		vaultAddress = address(vault);
		vaults.push(vaultAddress);
		vaultsByDeployer[msg.sender].push(vaultAddress);

		emit VaultCreated(vaultAddress, msg.sender, name, asset);

		return vaultAddress;
	}

	/**
	 * @notice Get total number of vaults
	 * @return count Total vault count
	 */
	function getVaultCount() external view returns (uint256 count) {
		return vaults.length;
	}

	/**
	 * @notice Get all vault addresses
	 * @return addresses Array of all vault addresses
	 */
	function getAllVaults() external view returns (address[] memory addresses) {
		return vaults;
	}

	/**
	 * @notice Get vaults deployed by a specific address
	 * @param deployer Address of the deployer
	 * @return addresses Array of vault addresses
	 */
	function getVaultsByDeployer(address deployer) external view returns (address[] memory addresses) {
		return vaultsByDeployer[deployer];
	}
}

