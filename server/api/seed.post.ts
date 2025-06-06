import { useModels } from '~/server/utils/db'

export default defineEventHandler(async (_event) => {
  try {
    const { Task, User } = useModels()
    
    // Sample tasks based on PRD
    const sampleTasks = [
      // Test (Ulrik)
      {
        title: "Design Creative Test Cases for Pet Dating App",
        category: "Test",
        description: "Use AI to design the most creative test cases for a dating app specifically for pets. Think outside the box!",
        estimatedTime: 25,
        difficulty: 2
      },
      {
        title: "Generate Edge-Case Scenarios for Smart Elevator",
        category: "Test", 
        description: "Get AI to generate the most amusing and unexpected edge-case scenarios for a smart elevator system.",
        estimatedTime: 20,
        difficulty: 2
      },

      // Project Management (Jon)
      {
        title: "Create Ultimate Sprint Retrospective Format",
        category: "Project Management",
        description: "Design the world's most motivating and effective sprint retrospective format using AI creativity.",
        estimatedTime: 30,
        difficulty: 2
      },
      {
        title: "AI-Assisted Difficult Stakeholder Management",
        category: "Project Management",
        description: "Design an AI-assisted methodology for handling the most challenging stakeholders in projects.",
        estimatedTime: 35,
        difficulty: 3
      },

      // Backend (Thor)
      {
        title: "Explain Microservices Through Cooking",
        category: "Backend",
        description: "Get AI to explain microservices architecture through a detailed cooking/recipe metaphor.",
        estimatedTime: 20,
        difficulty: 1
      },
      {
        title: "Design Time Travel API",
        category: "Backend",
        description: "Design a complete API for time travel functionality, including full documentation and edge cases.",
        estimatedTime: 40,
        difficulty: 3
      },

      // Frontend (Thomas B)
      {
        title: "Mind-Reading App UI Design",
        category: "Frontend",
        description: "Describe and design a user interface for an application that can read people's thoughts.",
        estimatedTime: 30,
        difficulty: 2
      },
      {
        title: "CSS Animation as Dance Choreography",
        category: "Frontend",
        description: "Create a CSS animation and explain it as if it were a detailed dance choreography.",
        estimatedTime: 25,
        difficulty: 2
      },

      // Sales (Line)
      {
        title: "Hogwarts IT System Proposal",
        category: "Sales",
        description: "Write the most convincing proposal for implementing a new IT system at Hogwarts School of Witchcraft and Wizardry.",
        estimatedTime: 35,
        difficulty: 3
      },
      {
        title: "AI Butler for Dogs Value Proposition",
        category: "Sales",
        description: "Create a compelling value proposition for an AI-powered butler service specifically designed for dogs.",
        estimatedTime: 20,
        difficulty: 2
      },

      // Business Analysis/EA (Andreas)
      {
        title: "Dream-Selling Business Process Map",
        category: "Business Analysis",
        description: "Map out a complete business process for a company that sells dreams to customers.",
        estimatedTime: 30,
        difficulty: 3
      },
      {
        title: "Santa's Enterprise Architecture",
        category: "Business Analysis",
        description: "Design a comprehensive enterprise architecture for Santa's Christmas operation at the North Pole.",
        estimatedTime: 35,
        difficulty: 3
      },

      // BUL/Sales (Maria)
      {
        title: "Pitch AI to 1850s Customer",
        category: "BUL/Sales",
        description: "Create a compelling sales pitch for AI solutions to a potential customer from the year 1850.",
        estimatedTime: 25,
        difficulty: 2
      },
      {
        title: "Sell Sand to Desert Dweller",
        category: "BUL/Sales",
        description: "Use AI as your sparring partner to develop a strategy for selling sand to someone living in a desert.",
        estimatedTime: 30,
        difficulty: 3
      },

      // Communication/Branding (Emma)
      {
        title: "Rebrand Nine as Superhero Organization",
        category: "Communication",
        description: "Use AI to rebrand Nine as a superhero organization, complete with powers, origin story, and mission.",
        estimatedTime: 30,
        difficulty: 2
      },
      {
        title: "Make Mondays Popular Viral Campaign",
        category: "Communication",
        description: "Create a viral marketing campaign to make Monday the most popular day of the week.",
        estimatedTime: 25,
        difficulty: 2
      }
    ]

    // First, create some sample users for testing
    const sampleUsers = [
      {
        id: 'user_anv',
        email: 'anv@nine.dk',
        name: 'Aku Nour Shirazi Valta',
        role: 'Software Developer',
        picture: null
      },
      {
        id: 'user_test1',
        email: 'test1@nine.dk',
        name: 'Test User One',
        role: 'Project Manager',
        picture: null
      },
      {
        id: 'user_test2',
        email: 'test2@nine.dk',
        name: 'Test User Two',
        role: 'Designer',
        picture: null
      },
      {
        id: 'user_test3',
        email: 'test3@nine.dk',
        name: 'Test User Three',
        role: 'Business Analyst',
        picture: null
      }
    ]

    // Check if users exist, if not create them
    const existingUserCount = await User.count()
    if (existingUserCount === 0) {
      await User.bulkCreate(sampleUsers)
    }

    // Check if tasks already exist
    const existingTaskCount = await Task.count()
    if (existingTaskCount > 0) {
      return {
        success: true,
        message: `Database already seeded with ${existingTaskCount} tasks and ${existingUserCount || sampleUsers.length} users`
      }
    }

    // Create tasks
    const createdTasks = await Task.bulkCreate(sampleTasks)

    return {
      success: true,
      message: `Successfully seeded ${createdTasks.length} tasks`,
      data: createdTasks
    }
  } catch (error) {
    console.error('Error seeding database:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})