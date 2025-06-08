import { createClient } from 'redis'

let redisClient: ReturnType<typeof createClient> | null = null

export async function getRedisClient() {
  if (!redisClient) {
    const config = useRuntimeConfig()

    if (!config.redisUrl) {
      throw new Error('Redis URL not configured')
    }

    redisClient = createClient({
      url: config.redisUrl,
    })

    redisClient.on('error', err => {
      console.error('Redis Client Error:', err)
    })

    redisClient.on('connect', () => {
      console.log('Redis Client Connected')
    })

    await redisClient.connect()
  }

  return redisClient
}

