import mongoose, { Schema, Document } from 'mongoose'

export interface IVault extends Document {
	address: string
	name: string
	description: string
	asset: string
	deployer: string
	totalAssets: string
	totalSupply: string
	createdAt: Date
	updatedAt: Date
}

const VaultSchema = new Schema<IVault>(
	{
		address: {
			type: String,
			required: true,
			unique: true,
			index: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		asset: {
			type: String,
			required: false,
			default: '0x0000000000000000000000000000000000000000',
		},
		deployer: {
			type: String,
			required: false,
			default: '0x0000000000000000000000000000000000000000',
			index: true,
		},
		totalAssets: {
			type: String,
			default: '0',
		},
		totalSupply: {
			type: String,
			default: '0',
		},
	},
	{
		timestamps: true,
	}
)

export const Vault = mongoose.model<IVault>('Vault', VaultSchema)

