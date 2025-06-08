export default defineNitroPlugin(async nitroApp => {
  console.log('🚀 Database plugin starting...')

  try {
    const config = useRuntimeConfig()

    if (!config.databaseUrl) {
      console.warn('⚠️ No DATABASE_URL found, skipping database initialization')
      return
    }

    console.log('📝 DATABASE_URL found, initializing database...')

    // Use the singleton database connection instead of creating a new one
    const { getDatabase } = await import('~/server/utils/db')
    const { initModels } = await import('~/server/models')

    const sequelize = await getDatabase()
    console.log('✅ Database connection established successfully')

    // Initialize models
    const { User, Team, Task, Submission, CompetitionSettings } = initModels(sequelize)

    // Sync database (create tables)
    await sequelize.sync({ alter: false }) // Use alter: true for development if needed
    console.log('🔧 Database tables synchronized')

    // Database is now initialized and ready for use

    // Auto-seed database if it's empty
    await autoSeedDatabase(sequelize, { User, Team, Task, Submission, CompetitionSettings })

    console.log('🎉 Database initialized successfully!')
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    // Don't throw error to allow app to start without database
    // throw error
  }
})

async function autoSeedDatabase(
  sequelize: any,
  { User, Team, Task, Submission, CompetitionSettings }: any
) {
  try {
    // Check if database needs seeding
    const [userCount, taskCount] = await Promise.all([User.count(), Task.count()])

    if (userCount > 0 && taskCount > 0) {
      console.log(`📊 Database already seeded (${userCount} users, ${taskCount} tasks)`)
      return
    }

    console.log('🌱 Auto-seeding database with Nine employees and tasks...')

    // Try to execute the generated seed SQL file
    try {
      const fs = await import('fs')
      const path = await import('path')

      const seedSqlPath = path.join(process.cwd(), 'database/seed.sql')

      if (fs.existsSync(seedSqlPath)) {
        console.log('📄 Found seed.sql file, executing...')
        const seedSql = fs.readFileSync(seedSqlPath, 'utf8')

        // Split SQL into individual statements and execute them
        const statements = seedSql
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('\\c'))

        for (const statement of statements) {
          if (statement.trim()) {
            try {
              await sequelize.query(statement)
            } catch (error: any) {
              // Ignore table creation errors if tables already exist
              if (
                !error.message.includes('already exists') &&
                !error.message.includes('duplicate key')
              ) {
                console.warn(
                  '⚠️ SQL statement failed:',
                  statement.substring(0, 100) + '...',
                  error.message
                )
              }
            }
          }
        }

        console.log('✅ Seed SQL executed successfully')

        // Verify seeding
        const [newUserCount, newTaskCount] = await Promise.all([User.count(), Task.count()])
        console.log(`📊 Database now has ${newUserCount} users and ${newTaskCount} tasks`)
      } else {
        console.log('📄 No seed.sql file found, using fallback seeding...')
        await fallbackSeed(User, Task)
      }
    } catch (error) {
      console.warn('⚠️ Failed to execute seed.sql, using fallback seeding...', error)
      await fallbackSeed(User, Task)
    }

    console.log('🌱 Database auto-seeding completed')
  } catch (error) {
    console.error('❌ Auto-seeding failed:', error)
    // Don't throw to allow app to continue
  }
}

async function fallbackSeed(User: any, Task: any) {
  // Minimal fallback seeding with just the essential mock user and a few tasks
  const fallbackUsers = [
    {
      id: 'user_anv',
      email: 'anv@nine.dk',
      name: 'Aku Nour Shirazi Valta',
      role: 'Software Developer',
      picture: null,
      isAdmin: false,
    },
  ]

  const fallbackTasks = [
    {
      title: 'Design Creative Test Cases for Pet Dating App',
      category: 'Test',
      description:
        'Use AI to design the most creative test cases for a dating app specifically for pets.',
      estimatedTime: 25,
      difficulty: 2,
    },
    {
      title: 'Create Ultimate Sprint Retrospective Format',
      category: 'Project Management',
      description: 'Design an effective sprint retrospective format using AI creativity.',
      estimatedTime: 30,
      difficulty: 2,
    },
  ]

  await User.bulkCreate(fallbackUsers)
  await Task.bulkCreate(fallbackTasks)
  console.log(`👥 Fallback seeded ${fallbackUsers.length} users and ${fallbackTasks.length} tasks`)
}
