'use client'

import { useEffect, useState } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useAccount, useChainId, useSwitchChain } from 'wagmi'
import { useContributorRegistry, useVaultFactory, useSparkVaultFactory, useQuadraticVoting, useDistribution, useVault } from './use-contracts'
import { parseEther, parseUnits, formatEther, Address } from 'viem'
import { getAssetAddress, getAssetDecimals } from '@/lib/assets'
import { useToast } from '@/hooks/use-toast'
import { useQueryClient } from '@tanstack/react-query'
import { CONTRACTS } from '@/lib/contracts'

/**
 * Hook for creating a vault
 */
export function useCreateVault() {
	const { address } = useAccount()
	const chainId = useChainId()
	const { switchChain } = useSwitchChain()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { address: factoryAddress, abi } = useVaultFactory()
	const { address: sparkFactoryAddress, abi: sparkAbi } = useSparkVaultFactory()

	const createVault = async (assetName: string, name: string, description: string, useSpark: boolean = false) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		// Check if on correct network
		if (chainId !== CONTRACTS.CHAIN_ID) {
			toast({
				title: 'Wrong Network',
				description: `Please switch to Base Sepolia (Chain ID: ${CONTRACTS.CHAIN_ID}). You are currently on Chain ID: ${chainId}`,
				variant: 'destructive',
			})
			
			// Try to switch automatically
			if (switchChain) {
				try {
					await switchChain({ chainId: CONTRACTS.CHAIN_ID })
					toast({
						title: 'Switching Network',
						description: 'Please approve the network switch in your wallet',
					})
				} catch (error: any) {
					toast({
						title: 'Network Switch Failed',
						description: error.message || 'Please manually switch to Base Sepolia in your wallet',
						variant: 'destructive',
					})
				}
			}
			return
		}

		const assetAddress = getAssetAddress(assetName)

		try {
			writeContract({
				address: (useSpark ? sparkFactoryAddress : factoryAddress) as Address,
				abi: (useSpark ? sparkAbi : abi) as any,
				functionName: 'createVault',
				args: [assetAddress, name, description],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create vault',
				variant: 'destructive',
			})
			throw error
		}
	}

	// Refresh vaults after successful creation
	useEffect(() => {
		if (isSuccess && hash) {
			// Wait a bit for the transaction to be indexed, then invalidate queries
			// We need to wait longer for Base Sepolia to index the transaction
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['vaults'] })
				queryClient.invalidateQueries({ queryKey: ['vaultInfo'] })
				queryClient.invalidateQueries({ queryKey: ['readContract'] })
				// Force a refetch of all vault-related queries
				queryClient.refetchQueries({ queryKey: ['vaults'] })
			}, 3000) // Wait 3 seconds for indexing on Base Sepolia
			
			toast({
				title: 'Success',
				description: 'Vault created successfully! Refreshing vault list...',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		createVault,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Hook for adding a contributor
 */
export function useAddContributor() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash, error: writeError } = useWriteContract()
	const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { address: registryAddress, abi } = useContributorRegistry()
	
	useEffect(() => {
		if (writeError) {
			const errorMessage = writeError.message || 'Failed to add contributor'
			if (errorMessage.includes('onlyOwner') || errorMessage.includes('Ownable')) {
				toast({
					title: 'Permission Denied',
					description: 'Only the ContributorRegistry owner can add contributors. Please contact the owner.',
					variant: 'destructive',
				})
			} else {
				toast({
					title: 'Error',
					description: errorMessage,
					variant: 'destructive',
				})
			}
		}
		if (receiptError) {
			const errorMessage = receiptError.message || 'Transaction failed'
			if (errorMessage.includes('onlyOwner') || errorMessage.includes('Ownable')) {
				toast({
					title: 'Transaction Failed',
					description: 'Only the ContributorRegistry owner can add contributors. The transaction was reverted.',
					variant: 'destructive',
				})
			} else {
				toast({
					title: 'Transaction Failed',
					description: errorMessage,
					variant: 'destructive',
				})
			}
		}
	}, [writeError, receiptError, toast])

	const addContributor = async (
		vaultAddress: Address,
		wallet: Address,
		name: string,
		role: string,
		monthlyAllocation: string
	) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		// Convert monthly allocation to wei (assuming 18 decimals for now)
		const allocation = parseEther(monthlyAllocation)

		try {
			writeContract({
				address: registryAddress as Address,
				abi,
				functionName: 'addContributor',
				args: [vaultAddress, wallet, name, role, allocation],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to add contributor',
				variant: 'destructive',
			})
			throw error
		}
	}

	useEffect(() => {
		if (isSuccess && hash) {
			setTimeout(() => {
				queryClient.invalidateQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
				queryClient.refetchQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
			queryClient.invalidateQueries({ queryKey: ['contributors'] })
				queryClient.invalidateQueries({ 
					queryKey: ['contributors'],
					exact: false,
				})
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Contributor added successfully! Refreshing contributor list...',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		addContributor,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Hook for depositing to a vault
 */
export function useDeposit() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash, error: writeError } = useWriteContract()
	const { isLoading: isConfirming, isSuccess, error: receiptError } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { abi } = useVault()
	
	// Track approval and deposit state
	const [approvalHash, setApprovalHash] = useState<string | null>(null)
	const [depositHash, setDepositHash] = useState<string | null>(null)
	const [isWaitingForApproval, setIsWaitingForApproval] = useState(false)
	const [pendingDeposit, setPendingDeposit] = useState<{
		vaultAddress: Address
		assetName: string
		amount: string
		receiver?: Address
		assetAddress?: Address
	} | null>(null)
	
	// Track approval transaction
	const { isLoading: isApprovalConfirming, isSuccess: isApprovalSuccess } = useWaitForTransactionReceipt({ 
		hash: approvalHash as `0x${string}` | undefined 
	})
	
	useEffect(() => {
		if (hash) {
			if (isWaitingForApproval) {
				setApprovalHash(hash)
				setDepositHash(null)
			} else {
				setDepositHash(hash)
			}
		}
	}, [hash, isWaitingForApproval])
	
	useEffect(() => {
		if (isApprovalSuccess && approvalHash && pendingDeposit) {
			setIsWaitingForApproval(false)
			setApprovalHash(null)
			
			setTimeout(() => {
				const { vaultAddress, assetName, amount, receiver, assetAddress: assetAddressParam } = pendingDeposit
				const finalAssetAddress = assetAddressParam || getAssetAddress(assetName)
				const decimals = getAssetDecimals(assetName)
				const amountWei = parseUnits(amount, decimals)
				
				toast({
					title: 'Depositing...',
					description: 'Please confirm the transaction in your wallet',
				})

				writeContract({
					address: vaultAddress,
					abi: abi as any,
					functionName: 'deposit',
					args: [amountWei, receiver || address],
				})
				
				setPendingDeposit(null)
			}, 1000)
		}
	}, [isApprovalSuccess, approvalHash, pendingDeposit, address, abi, toast, writeContract])

	const deposit = async (vaultAddress: Address, assetName: string, amount: string, receiver?: Address, assetAddress?: Address) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		// Use provided asset address or convert from asset name
		const finalAssetAddress = assetAddress || getAssetAddress(assetName)
		
		// Get decimals from asset name or use 18 as default
		const decimals = getAssetDecimals(assetName)
		const amountWei = parseUnits(amount, decimals)

		if (amountWei === 0n) {
			toast({
				title: 'Error',
				description: 'Amount must be greater than 0',
				variant: 'destructive',
			})
			return
		}

		try {
			const assetAddressToUse = finalAssetAddress
			
			if (assetName === 'ETH') {
				const wethAddress = getAssetAddress('WETH')
				
				toast({
					title: 'Converting ETH to USDC...',
					description: 'Step 1: Wrapping ETH to WETH',
				})

				writeContract({
					address: wethAddress as Address,
					abi: [
						{
							constant: false,
							inputs: [],
							name: 'deposit',
							outputs: [],
							payable: true,
							stateMutability: 'payable',
							type: 'function',
						},
					],
					functionName: 'deposit',
					value: amountWei,
				})
				
				return
			}
			
			if (assetName !== 'ETH') {
				const allowance = await queryClient.fetchQuery({
					queryKey: ['allowance', assetAddressToUse, address, vaultAddress],
					queryFn: async () => {
						const { readContract } = await import('wagmi/actions')
						const { createPublicClient, http } = await import('viem')
						const { baseSepolia } = await import('wagmi/chains')
						
						const publicClient = createPublicClient({
							chain: baseSepolia,
							transport: http(),
						})
						
						return await publicClient.readContract({
							address: assetAddressToUse as Address,
							abi: [
								{
									constant: true,
									inputs: [
										{ name: 'owner', type: 'address' },
										{ name: 'spender', type: 'address' },
									],
									name: 'allowance',
									outputs: [{ name: '', type: 'uint256' }],
									type: 'function',
								},
							],
							functionName: 'allowance',
							args: [address, vaultAddress],
						}) as bigint
					},
				})

				if (allowance < amountWei) {
					toast({
						title: 'Approving...',
						description: 'Please approve the transaction in your wallet',
					})

					setPendingDeposit({
						vaultAddress,
						assetName,
						amount,
						receiver,
						assetAddress,
					})
					setIsWaitingForApproval(true)

					writeContract({
						address: assetAddressToUse as Address,
						abi: [
							{
								constant: false,
								inputs: [
									{ name: 'spender', type: 'address' },
									{ name: 'amount', type: 'uint256' },
								],
								name: 'approve',
								outputs: [{ name: '', type: 'bool' }],
								type: 'function',
							},
						],
						functionName: 'approve',
						args: [vaultAddress, amountWei],
					})

					return
				}
			}

			toast({
				title: 'Depositing...',
				description: 'Please confirm the transaction in your wallet',
			})

			writeContract({
				address: vaultAddress,
				abi: abi as any,
				functionName: 'deposit',
				args: [amountWei, receiver || address],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to deposit',
				variant: 'destructive',
			})
			setIsWaitingForApproval(false)
			setPendingDeposit(null)
			throw error
		}
	}

	useEffect(() => {
		if (isSuccess && hash && hash === depositHash && !isWaitingForApproval) {
			setTimeout(() => {
				queryClient.invalidateQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
				queryClient.refetchQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
				queryClient.invalidateQueries({ queryKey: ['vaults'] })
				queryClient.invalidateQueries({ queryKey: ['vaultInfo'] })
				queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
				queryClient.invalidateQueries({ queryKey: ['allowance'] })
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Deposit successful! Refreshing vault data...',
			})
		} else if (isSuccess && hash === approvalHash) {
			toast({
				title: 'Approval confirmed',
				description: 'Proceeding with deposit...',
			})
		}
	}, [isSuccess, hash, depositHash, approvalHash, isWaitingForApproval, queryClient, toast])

	return {
		deposit,
		isPending: isPending || isConfirming || isApprovalConfirming,
		isSuccess: isSuccess && hash === depositHash, // Only true for deposit, not approval
		hash: depositHash || hash, // Return deposit hash if available, otherwise current hash
		isApproving: isWaitingForApproval || isApprovalConfirming,
	}
}

/**
 * Hook for withdrawing from a vault
 */
export function useWithdraw() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { abi } = useVault()

	const withdraw = async (vaultAddress: Address, shares: string, receiver?: Address, owner?: Address) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		const sharesWei = parseEther(shares)

		if (sharesWei === 0n) {
			toast({
				title: 'Error',
				description: 'Amount must be greater than 0',
				variant: 'destructive',
			})
			return
		}

		// Allow withdrawal - let the contract handle balance validation
		try {
			toast({
				title: 'Withdrawing...',
				description: 'Please confirm the transaction in your wallet',
			})

			writeContract({
				address: vaultAddress,
				abi: abi as any,
				functionName: 'redeem',
				args: [sharesWei, receiver || address, owner || address],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to withdraw',
				variant: 'destructive',
			})
			throw error
		}
	}

	// Refresh vault data after successful withdrawal
	useEffect(() => {
		if (isSuccess && hash) {
			setTimeout(() => {
				queryClient.invalidateQueries({ queryKey: ['vaults'] })
				queryClient.invalidateQueries({ queryKey: ['vaultInfo'] })
				queryClient.invalidateQueries({ queryKey: ['balanceOf'] })
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Withdrawal successful!',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		withdraw,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Hook for voting
 */
export function useVote() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { address: votingAddress, abi } = useQuadraticVoting()

	const vote = async (votingId: bigint, voteCount: number, isFor: boolean) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		// Calculate cost (quadratic: n²)
		const cost = BigInt(voteCount * voteCount)

		try {
			writeContract({
				address: votingAddress as Address,
				abi,
				functionName: 'vote',
				args: [votingId, BigInt(voteCount), isFor],
				value: cost, // Pay in native token
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to vote',
				variant: 'destructive',
			})
			throw error
		}
	}

	useEffect(() => {
		if (isSuccess && hash) {
			setTimeout(() => {
				queryClient.invalidateQueries({ 
					queryKey: ['votings'],
					exact: false,
				})
				queryClient.refetchQueries({ 
					queryKey: ['votings'],
					exact: false,
				})
				queryClient.invalidateQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Vote cast successfully! Refreshing voting data...',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		vote,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Hook for creating a voting
 */
export function useCreateVoting() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { address: votingAddress, abi } = useQuadraticVoting()

	const createVoting = async (
		vaultAddress: Address,
		nominee: Address,
		nomineeName: string,
		role: string,
		description: string,
		duration: number // in seconds
	) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		try {
			writeContract({
				address: votingAddress as Address,
				abi,
				functionName: 'createVoting',
				args: [vaultAddress, nominee, nomineeName, role, description, BigInt(duration)],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to create voting',
				variant: 'destructive',
			})
			throw error
		}
	}

	useEffect(() => {
		if (isSuccess && hash) {
			setTimeout(() => {
				queryClient.invalidateQueries({ 
					queryKey: ['votings'],
					exact: false,
				})
				queryClient.refetchQueries({ 
					queryKey: ['votings'],
					exact: false,
				})
				queryClient.invalidateQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Voting created successfully! Refreshing voting list...',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		createVoting,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Hook for scheduling a distribution
 */
export function useScheduleDistribution() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()
	const queryClient = useQueryClient()
	const { address: distributionAddress, abi } = useDistribution()

	const scheduleDistribution = async (
		vaultAddress: Address,
		scheduledTime: number, // Unix timestamp
		method: number // 0 = Proportional, 1 = Equal, 2 = VotingWeighted
	) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		try {
			writeContract({
				address: distributionAddress as Address,
				abi,
				functionName: 'scheduleDistribution',
				args: [vaultAddress, BigInt(scheduledTime), method],
			})
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to schedule distribution',
				variant: 'destructive',
			})
			throw error
		}
	}

	useEffect(() => {
		if (isSuccess && hash) {
			setTimeout(() => {
				queryClient.invalidateQueries({ 
					queryKey: ['distributions'],
					exact: false,
				})
				queryClient.refetchQueries({ 
					queryKey: ['distributions'],
					exact: false,
				})
				queryClient.invalidateQueries({ 
					queryKey: ['readContract'],
					exact: false,
				})
			}, 2000)
			
			toast({
				title: 'Success',
				description: 'Distribution scheduled successfully! Refreshing distribution list...',
			})
		}
	}, [isSuccess, hash, queryClient, toast])

	return {
		scheduleDistribution,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

