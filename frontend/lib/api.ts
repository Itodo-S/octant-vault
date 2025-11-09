/**
 * API client for backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export class ApiClient {
	private baseUrl: string

	constructor(baseUrl: string = API_BASE_URL) {
		this.baseUrl = baseUrl
	}

	private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
		const response = await fetch(`${this.baseUrl}${endpoint}`, {
			...options,
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				...options?.headers,
			},
		})

		if (!response.ok) {
			throw new Error(`API Error: ${response.statusText}`)
		}

		return response.json()
	}

	// Vaults
	async getVaults() {
		return this.request<{ success: boolean; data: any[] }>('/vaults')
	}

	async getVault(address: string) {
		return this.request<{ success: boolean; data: any }>(`/vaults/${address}`)
	}

	async syncVaults() {
		return this.request<{ success: boolean; data: any[]; message: string }>('/vaults/sync')
	}

	// Contributors
	async getContributors() {
		return this.request<{ success: boolean; data: any[] }>('/contributors')
	}

	async getVaultContributors(vaultAddress: string) {
		return this.request<{ success: boolean; data: any[] }>(`/contributors/vault/${vaultAddress}`)
	}

	// Votings
	async getVotings() {
		return this.request<{ success: boolean; data: any[] }>('/votings')
	}

	async getActiveVotings() {
		return this.request<{ success: boolean; data: any[] }>('/votings/active')
	}

	async getPastVotings() {
		return this.request<{ success: boolean; data: any[] }>('/votings/past')
	}

	async getVotingById(votingId: number) {
		return this.request<{ success: boolean; data: any }>(`/votings/${votingId}`)
	}

	// Distributions
	async getDistributions() {
		return this.request<{ success: boolean; data: any[] }>('/distributions')
	}

	async getUpcomingDistributions() {
		return this.request<{ success: boolean; data: any[] }>('/distributions/upcoming')
	}

	async getRecentDistributions() {
		return this.request<{ success: boolean; data: any[] }>('/distributions/recent')
	}

	async getDistributionById(scheduleId: number) {
		return this.request<{ success: boolean; data: any }>(`/distributions/${scheduleId}`)
	}

	async syncDistributions() {
		return this.request<{ success: boolean; data: any[]; message: string }>('/distributions/sync')
	}
}

export const apiClient = new ApiClient()