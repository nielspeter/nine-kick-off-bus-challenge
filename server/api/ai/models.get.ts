import { getServerSession } from '#auth'
import OpenAI from 'openai'

export default defineEventHandler(async event => {
  try {
    console.log('🎯 Models API called')

    // Verify user session
    const session = await getServerSession(event)
    if (!session?.user?.email) {
      console.log('❌ No user session found')
      throw createError({
        statusCode: 401,
        statusMessage: 'Authentication required',
      })
    }

    console.log('✅ User session verified:', session.user.email)

    // Initialize LiteLLM OpenAI-compatible client
    const config = useRuntimeConfig()
    const masterKey = config.litellmMasterKey || 'sk-1234567890abcdef'
    const litellm = new OpenAI({
      baseURL: 'http://litellm:4000/v1', // Point to LiteLLM proxy
      apiKey: masterKey, // Use master key from config
      defaultHeaders: {
        Authorization: `Bearer ${masterKey}`,
      },
    })

    // Fetch available models from LiteLLM proxy using OpenAI SDK
    console.log('🔑 Fetching models from LiteLLM...')
    try {
      const response = await litellm.models.list()
      console.log('✅ Models fetched successfully, count:', response.data?.length)

      // Transform the response to include model metadata
      const models = response.data.map((model: any) => ({
        id: model.id,
        name: model.id, // Use ID as display name
        provider: getProviderFromModel(model.id),
        description: getModelDescription(model.id),
        maxTokens: model.max_tokens || 4096,
      }))

      return {
        success: true,
        models,
        total: models.length,
      }
    } catch (fetchError) {
      console.error('❌ LiteLLM models fetch error:', fetchError)

      // Return fallback models if LiteLLM is unavailable
      const fallbackModels = [
        {
          id: 'gpt-4o-mini',
          name: 'GPT-4o Mini',
          provider: 'OpenAI',
          description: 'Fast and efficient GPT-4 model',
          maxTokens: 4096,
        },
        {
          id: 'claude-3-5-sonnet',
          name: 'Claude 3.5 Sonnet',
          provider: 'Anthropic',
          description: 'Balanced performance and capability',
          maxTokens: 4096,
        },
      ]

      console.log('⚠️ Using fallback models due to LiteLLM unavailability')
      return {
        success: true,
        models: fallbackModels,
        total: fallbackModels.length,
        fallback: true,
      }
    }
  } catch (error: unknown) {
    console.error('💥 Models API Error:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })

    if (error && typeof error === 'object' && 'statusCode' in error) throw error

    throw createError({
      statusCode: 500,
      statusMessage: error instanceof Error ? error.message : 'Failed to fetch AI models',
    })
  }
})

function getProviderFromModel(modelId: string): string {
  if (modelId.includes('gpt') || modelId.includes('openai')) return 'OpenAI'
  if (modelId.includes('claude') || modelId.includes('anthropic')) return 'Anthropic'
  if (modelId.includes('gemini') || modelId.includes('google')) return 'Google'
  return 'Unknown'
}

function getModelDescription(modelId: string): string {
  const descriptions: Record<string, string> = {
    'gpt-4o-mini': 'Fast and efficient GPT-4 model optimized for speed',
    'gpt-4o': 'Latest GPT-4 model with multimodal capabilities',
    'claude-3-5-sonnet': 'Balanced performance with strong reasoning abilities',
    'claude-3-5-haiku': 'Fast Claude model optimized for quick responses',
    'gemini-1.5-pro': "Google's advanced model with long context support",
    'gemini-1.5-flash': 'Fast Gemini model for quick interactions',
  }

  return descriptions[modelId] || 'AI language model'
}
