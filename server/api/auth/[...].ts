import { NuxtAuthHandler } from '#auth'

export default NuxtAuthHandler({
  secret: useRuntimeConfig().authSecret,
  providers: [
    {
      id: 'fake-auth',
      name: 'Fake Auth',
      type: 'credentials',
      credentials: {
        userId: { label: 'User ID', type: 'text' },
      },
      async authorize(credentials) {
        console.log('🔍 Fake auth authorize called with:', credentials)
        const config = useRuntimeConfig()

        // Only allow fake auth when AUTH_MODE=fake
        if (config.public.authMode !== 'fake') {
          console.log('❌ Fake auth disabled, AUTH_MODE:', config.public.authMode)
          return null
        }

        if (!credentials?.userId) {
          console.log('❌ No userId provided in credentials')
          return null
        }

        try {
          const { Sequelize } = await import('sequelize')
          const { initModels } = await import('~/server/models')

          const sequelize = new Sequelize(config.databaseUrl, { logging: false })
          const { User } = initModels(sequelize)

          const user = await User.findByPk(credentials.userId as string)
          await sequelize.close()

          if (!user) {
            console.log('❌ User not found:', credentials.userId)
            return null
          }

          console.log('✅ User found, returning:', user.name, '(Admin:', user.isAdmin, ')')
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.picture,
            isAdmin: user.isAdmin,
          }
        } catch (error) {
          console.error('❌ Fake auth error:', error)
          return null
        }
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.image = user.image
        token.isAdmin = (user as any).isAdmin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.image as string
        ;(session.user as any).isAdmin = token.isAdmin as boolean
      }
      return session
    },
  },
})
