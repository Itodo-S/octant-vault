import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database'
import { errorHandler } from './middleware/errorHandler'
import { routes } from './routes'
import { eventIndexer } from './services/eventIndexer'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware - Configure Helmet first
app.use(helmet({
	crossOriginResourcePolicy: { policy: "cross-origin" },
	crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}))

// CORS Configuration
const allowedOrigins = [
	'https://octant-vault.vercel.app',
	process.env.FRONTEND_URL,
	'http://localhost:8080',
	'http://localhost:5173',
	'http://localhost:3000',
].filter(Boolean) as string[]

// Log configuration on startup
console.log('🔐 CORS Configuration:')
console.log('Allowed origins:', allowedOrigins)
console.log('Environment:', process.env.NODE_ENV || 'development')

app.use(cors({
	origin: (origin, callback) => {
		console.log('📨 Incoming request from origin:', origin || 'no-origin')
		
		// Allow requests with no origin (mobile apps, Postman, curl)
		if (!origin) {
			console.log('✅ Allowing request with no origin')
			return callback(null, true)
		}
		
		// Check if origin is in allowed list
		if (allowedOrigins.includes(origin)) {
			console.log('✅ Origin allowed:', origin)
			return callback(null, true)
		}
		
		// In development, allow all localhost origins
		if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) {
			console.log('✅ Allowing localhost in development:', origin)
			return callback(null, true)
		}
		
		// Reject with detailed error
		console.error('❌ CORS blocked origin:', origin)
		console.error('   Allowed origins:', allowedOrigins)
		callback(new Error(`Origin ${origin} not allowed by CORS`))
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	exposedHeaders: ['Content-Range', 'X-Content-Range'],
	maxAge: 600 // Cache preflight for 10 minutes
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
	res.json({ 
		message: 'Welcome to the Octant Vault Backend API',
		version: '1.0.0',
		timestamp: new Date().toISOString()
	})
})

// Health check
app.get('/health', (req, res) => {
	res.json({ 
		status: 'ok', 
		timestamp: new Date().toISOString(),
		port: PORT,
		environment: process.env.NODE_ENV || 'development'
	})
})

// API Routes
app.use(process.env.API_PREFIX || '/api/v1', routes)

// Error handling
app.use(errorHandler)

// Start server
async function startServer() {
	try {
		// Connect to MongoDB
		await connectDatabase()
		console.log('✅ Connected to MongoDB')

		// Start event indexer
		await eventIndexer.start()
		console.log('✅ Event indexer started')

		// Start Express server
		app.listen(PORT, () => {
			console.log(`🚀 Server running on port ${PORT}`)
			console.log(`📡 API available at http://localhost:${PORT}${process.env.API_PREFIX || '/api/v1'}`)
			console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`)
		})
	} catch (error) {
		console.error('❌ Failed to start server:', error)
		process.exit(1)
	}
}

// Graceful shutdown
process.on('SIGTERM', async () => {
	console.log('SIGTERM received, shutting down gracefully...')
	await eventIndexer.stop()
	process.exit(0)
})

process.on('SIGINT', async () => {
	console.log('SIGINT received, shutting down gracefully...')
	await eventIndexer.stop()
	process.exit(0)
})

startServer()