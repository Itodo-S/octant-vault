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

// CORS configuration - must be before other middleware
const allowedOrigins = [
	process.env.FRONTEND_URL,
	'http://localhost:8080',
	'http://localhost:5173',
	'http://localhost:3000',
	'http://127.0.0.1:3000',
	'http://localhost:3001',
].filter(Boolean) as string[]

app.use(cors({
	origin: (origin, callback) => {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true)

		// Check if origin is in allowed list
		if (allowedOrigins.includes(origin)) {
			callback(null, true)
		} else {
			// In development, allow all localhost origins
			if (process.env.NODE_ENV === 'development' && origin.includes('localhost')) {
				callback(null, true)
			} else {
				callback(new Error('Not allowed by CORS'))
			}
		}
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Content-Type',
		'Authorization',
		'X-Requested-With',
		'Accept',
		'Origin',
		'Access-Control-Request-Method',
		'Access-Control-Request-Headers',
	],
	exposedHeaders: ['Content-Range', 'X-Content-Range'],
	preflightContinue: false,
	optionsSuccessStatus: 204,
}))

// Middleware - configure helmet to not interfere with CORS
app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' },
	crossOriginEmbedderPolicy: false,
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (_, res) => {
	res.send('Welcome to the Octant Vault Backend API')
})

// Health check
app.get('/health', (req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() })
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

startServer()