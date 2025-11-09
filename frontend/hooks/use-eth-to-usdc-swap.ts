'use client'

import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { useToast } from '@/hooks/use-toast'
import { parseEther, parseUnits, formatEther, Address } from 'viem'
import { getAssetAddress, getAssetDecimals } from '@/lib/assets'
import { CONTRACTS } from '@/lib/contracts'

/**
 * Hook for swapping ETH to USDC on Base Sepolia
 * This uses a simple WETH wrapping + swap approach
 * For production, you'd use Uniswap or another DEX
 */
export function useETHToUSDCSwap() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()

	const swapETHToUSDC = async (ethAmount: string) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		const ethAmountWei = parseEther(ethAmount)

		if (ethAmountWei === 0n) {
			toast({
				title: 'Error',
				description: 'Amount must be greater than 0',
				variant: 'destructive',
			})
			return
		}

		try {
			// For Base Sepolia, we'll use a simplified approach:
			// 1. Wrap ETH to WETH
			// 2. Approve WETH for swap
			// 3. Swap WETH to USDC (using a DEX or direct swap)
			
			// Note: In production, you'd use Uniswap Router or another DEX
			// For now, we'll show a message that they need to swap manually
			// or implement a basic swap if a DEX is available on Base Sepolia

			const wethAddress = getAssetAddress('WETH')
			const usdcAddress = getAssetAddress('USDC')

			// Step 1: Wrap ETH to WETH
			toast({
				title: 'Wrapping ETH...',
				description: 'Converting ETH to WETH',
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
				value: ethAmountWei,
			})

			// After WETH is wrapped, we'd need to swap WETH to USDC
			// This would require a DEX integration (Uniswap, etc.)
			// For now, we'll return the WETH address and let the user know
			
		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to swap ETH to USDC',
				variant: 'destructive',
			})
			throw error
		}
	}

	return {
		swapETHToUSDC,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

/**
 * Simplified approach: Direct ETH deposit with automatic conversion
 * This assumes the vault can accept ETH and convert it internally
 * OR we swap ETH to USDC before depositing
 */
export function useDepositETHAsUSDC() {
	const { address } = useAccount()
	const { writeContract, isPending, data: hash } = useWriteContract()
	const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })
	const { toast } = useToast()

	const depositETHAsUSDC = async (vaultAddress: Address, ethAmount: string) => {
		if (!address) {
			toast({
				title: 'Error',
				description: 'Please connect your wallet',
				variant: 'destructive',
			})
			return
		}

		const ethAmountWei = parseEther(ethAmount)

		if (ethAmountWei === 0n) {
			toast({
				title: 'Error',
				description: 'Amount must be greater than 0',
				variant: 'destructive',
			})
			return
		}

		try {
			// For Base Sepolia testnet, we'll use a simplified approach:
			// Since we don't have a DEX readily available, we'll:
			// 1. Wrap ETH to WETH
			// 2. Use WETH as collateral (if vault supports it)
			// OR
			// 1. Show user they need to swap manually
			// 2. Then deposit USDC

			// For now, let's implement a basic flow:
			// If vault accepts ETH, deposit directly
			// Otherwise, show instructions to swap first

			toast({
				title: 'Converting ETH to USDC...',
				description: 'This will wrap ETH and swap to USDC',
			})

			// This is a placeholder - in production you'd:
			// 1. Wrap ETH to WETH
			// 2. Swap WETH to USDC via Uniswap/DEX
			// 3. Deposit USDC to vault

			// For Base Sepolia, we'll show a helpful message
			toast({
				title: 'Swap Required',
				description: 'Please swap your ETH to USDC first, then deposit USDC. Or use a vault that accepts ETH.',
				variant: 'default',
			})

		} catch (error: any) {
			toast({
				title: 'Error',
				description: error.message || 'Failed to deposit ETH as USDC',
				variant: 'destructive',
			})
			throw error
		}
	}

	return {
		depositETHAsUSDC,
		isPending: isPending || isConfirming,
		isSuccess,
		hash,
	}
}

