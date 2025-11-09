// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SparkVault } from './SparkVault.sol';
import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { Ownable } from '@openzeppelin/contracts/access/Ownable.sol';

/**
 * @title SparkVaultFactory
 * @notice Factory contract for deploying new Spark-integrated ERC-4626 vaults
 * @dev Creates vaults that integrate with Spark's curated yield (SparkLend) for yield-donating strategies
 * 
 * Integration with Spark Protocol:
 * - Uses SparkLend's IPool interface for supplying/withdrawing assets
 * - Tracks yield via Spark aToken balance (interest-bearing tokens)
 * - Implements yield-donating strategy as per Spark's curated yield requirements
 * 
 * References:
 * - Spark Documentation: https://docs.spark.fi/
 * - SparkLend: https://docs.spark.fi/developers/sparklend
 * - Spark Deployments: https://docs.spark.fi/developers/deployments
 */
contract SparkVaultFactory is Ownable {
	/// @notice Array of all deployed vaults
	address[] public vaults;

	/// @notice Mapping from deployer to their vaults
	mapping(address => address[]) public vaultsByDeployer;

	/// @notice Mapping from asset to Spark pool and aToken addresses
	mapping(address => SparkConfig) public sparkConfigs;

	/// @notice Spark configuration for an asset
	struct SparkConfig {
		address sparkPool;
		address sparkAToken;
		bool isConfigured;
	}

	/// @notice Events
	event VaultCreated(
		address indexed vault,
		address indexed deployer,
		string name,
		address asset,
		address indexed sparkPool
	);
	event SparkConfigRegistered(address indexed asset, address sparkPool, address sparkAToken);

	/**
	 * @notice Initialize the factory
	 * @param owner Owner address
	 */
	constructor(address owner) Ownable(owner) {}

	/**
	 * @notice Register Spark configuration for an asset
	 * @param asset The underlying asset token address (e.g., DAI, USDC)
	 * @param sparkPoolAddress Address of Spark Pool (SparkLend's main contract)
	 * @param sparkATokenAddress Address of Spark aToken for this asset
	 * @dev To get aToken address: call sparkPool.getReserveData(asset) and use the aTokenAddress field
	 *      Reference: https://docs.spark.fi/developers/sparklend
	 * 
	 * Spark Pool Addresses:
	 * - Ethereum Mainnet: [See Spark deployments documentation]
	 * - Gnosis Chain: [See Spark deployments documentation]
	 * Reference: https://docs.spark.fi/developers/deployments
	 */
	function registerSparkConfig(
		address asset,
		address sparkPoolAddress,
		address sparkATokenAddress
	) external onlyOwner {
		require(asset != address(0), 'SparkVaultFactory: invalid asset address');
		require(sparkPoolAddress != address(0), 'SparkVaultFactory: invalid spark pool address');
		require(sparkATokenAddress != address(0), 'SparkVaultFactory: invalid spark aToken address');

		sparkConfigs[asset] = SparkConfig({
			sparkPool: sparkPoolAddress,
			sparkAToken: sparkATokenAddress,
			isConfigured: true
		});

		emit SparkConfigRegistered(asset, sparkPoolAddress, sparkATokenAddress);
	}

	/**
	 * @notice Create a new Spark-integrated vault
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
		require(asset != address(0), 'SparkVaultFactory: invalid asset address');
		require(bytes(name).length > 0, 'SparkVaultFactory: name required');

		SparkConfig memory config = sparkConfigs[asset];
		require(config.isConfigured, 'SparkVaultFactory: spark config not registered');

		SparkVault vault = new SparkVault(
			IERC20(asset),
			config.sparkPool,
			config.sparkAToken,
			name,
			description,
			msg.sender
		);

		vaultAddress = address(vault);
		vaults.push(vaultAddress);
		vaultsByDeployer[msg.sender].push(vaultAddress);

		emit VaultCreated(vaultAddress, msg.sender, name, asset, config.sparkPool);

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

	/**
	 * @notice Get Spark configuration for an asset
	 * @param asset Asset token address
	 * @return sparkPool Address of Spark Lending Pool
	 * @return sparkAToken Address of Spark aToken
	 * @return isConfigured Whether configuration exists
	 */
	function getSparkConfig(address asset)
		external
		view
		returns (address sparkPool, address sparkAToken, bool isConfigured)
	{
		SparkConfig memory config = sparkConfigs[asset];
		return (config.sparkPool, config.sparkAToken, config.isConfigured);
	}
}

