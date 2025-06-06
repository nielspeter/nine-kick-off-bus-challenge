#!/usr/bin/env node

/**
 * Fetch Nine employees and seed database
 * 
 * This script fetches employee data from nine.dk/mennesker/ and seeds the database
 * It can be run multiple times safely - it only inserts data if tables are empty.
 * 
 * Usage:
 *   node scripts/fetch-and-seed.js
 *   npm run db:fetch-seed
 */

import { Sequelize } from 'sequelize'
import 'dotenv/config'
import { JSDOM } from 'jsdom'

// Database configuration
const databaseUrl = process.env.DATABASE_URL || 'postgresql://nineuser:ninepass@localhost:5432/kickoff_challenge'

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
})

// Fetch employees from Nine website
async function fetchNineEmployees() {
  try {
    console.log('🌐 Fetching employees from nine.dk/mennesker/...')
    
    const response = await fetch('https://nine.dk/mennesker/')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document
    
    const employees = []
    
    // Find all employee cards/elements
    // This selector might need adjustment based on the actual HTML structure
    const employeeElements = document.querySelectorAll('.person, .employee, .team-member, [data-person], .people-item')
    
    if (employeeElements.length === 0) {
      // Try alternative selectors
      const alternativeSelectors = [
        'article',
        '.card',
        '.profile',
        '[href*="@nine.dk"]',
        'a[href*="mailto"]'
      ]
      
      for (const selector of alternativeSelectors) {
        const elements = document.querySelectorAll(selector)
        if (elements.length > 0) {
          console.log(`Found ${elements.length} elements with selector: ${selector}`)
          break
        }
      }
    }
    
    // Extract email addresses and names from the page
    const emailRegex = /([a-zA-Z0-9._%+-]+@nine\.dk)/g
    const nameRegex = /([A-ZÆØÅ][a-zæøå]+ (?:[A-ZÆØÅ][a-zæøå]+ )*[A-ZÆØÅ][a-zæøå]+)/g
    
    const emails = [...html.matchAll(emailRegex)].map(match => match[1])
    const names = [...html.matchAll(nameRegex)].map(match => match[1])
    
    console.log(`📧 Found ${emails.length} email addresses`)
    console.log(`👤 Found ${names.length} potential names`)
    
    // Create employee objects
    const uniqueEmails = [...new Set(emails)]
    const uniqueNames = [...new Set(names)]
    
    // Match emails with names (simple approach)
    const maxLength = Math.max(uniqueEmails.length, uniqueNames.length)
    
    for (let i = 0; i < maxLength; i++) {
      const email = uniqueEmails[i]
      const name = uniqueNames[i] || `Employee ${i + 1}`
      
      if (email) {
        // Generate ID from email
        const id = 'user_' + email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')
        
        // Determine role and admin status
        const isAdmin = ['jsp@nine.dk', 'ulrik@nine.dk', 'thomas@nine.dk', 'thor@nine.dk'].includes(email)
        const role = isAdmin ? 'Senior Consultant' : 'Consultant'
        
        employees.push({
          id,
          email,
          name,
          role,
          isAdmin
        })
      }
    }
    
    console.log(`✅ Processed ${employees.length} employees`)
    return employees
    
  } catch (error) {
    console.error('❌ Error fetching employees:', error)
    
    // Fallback to hardcoded employees if fetching fails
    console.log('🔄 Using fallback employee list...')
    return getFallbackEmployees()
  }
}

// Fallback employees list
function getFallbackEmployees() {
  return [
    // Key organizers/admins from PRD
    { id: 'user_jon', email: 'jsp@nine.dk', name: 'Jon Städe-Persson', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_ulrik', email: 'ulrik@nine.dk', name: 'Ulrik Høyer', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_thomas_b', email: 'thomas@nine.dk', name: 'Thomas Bentzen', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_thor', email: 'thor@nine.dk', name: 'Thor Larsen', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_emma', email: 'edr@nine.dk', name: 'Emma Dalmose Ruberg', role: 'Consultant', isAdmin: false },
    { id: 'user_line', email: 'line@nine.dk', name: 'Line Nielsen', role: 'Consultant', isAdmin: false },
    { id: 'user_maria', email: 'maria@nine.dk', name: 'Maria Hansen', role: 'Senior Consultant', isAdmin: false },
    { id: 'user_andreas', email: 'anh@nine.dk', name: 'Andreas Hollensen', role: 'Managing Consultant', isAdmin: false },
    
    // Sample additional employees
    { id: 'user_aku', email: 'anv@nine.dk', name: 'Aku Nour Shirazi Valta', role: 'Senior Consultant', isAdmin: false },
    { id: 'user_alex', email: 'aes@nine.dk', name: 'Alex Esmann', role: 'Senior Consultant', isAdmin: false },
    { id: 'user_anders_aa', email: 'aaa@nine.dk', name: 'Anders Aaberg', role: 'Managing Consultant', isAdmin: false },
    { id: 'user_anders_jp', email: 'ajp@nine.dk', name: 'Anders Julfeldt Petersen', role: 'Senior Consultant', isAdmin: false },
    { id: 'user_anders_mh', email: 'aha@nine.dk', name: 'Anders Mørk Hansen', role: 'Principal Consultant', isAdmin: false }
  ]
}

// Challenge tasks data
const tasks = [
  // Test (Ulrik)
  {
    title: 'Design Creative Test Cases for Pet Dating App',
    category: 'Test',
    description: 'Use AI to design the most creative test cases for a dating app specifically for pets. Think outside the box!',
    estimatedTime: 25,
    difficulty: 2
  },
  {
    title: 'Generate Edge-Case Scenarios for Smart Elevator',
    category: 'Test',
    description: 'Get AI to generate the most amusing and unexpected edge-case scenarios for a smart elevator system.',
    estimatedTime: 20,
    difficulty: 2
  },
  
  // Project Management (Jon)
  {
    title: 'Create Ultimate Sprint Retrospective Format',
    category: 'Project Management',
    description: 'Design the world\'s most motivating and effective sprint retrospective format using AI creativity.',
    estimatedTime: 30,
    difficulty: 2
  },
  {
    title: 'AI-Assisted Difficult Stakeholder Management',
    category: 'Project Management',
    description: 'Design an AI-assisted methodology for handling the most challenging stakeholders in projects.',
    estimatedTime: 35,
    difficulty: 3
  },
  
  // Backend (Thor)
  {
    title: 'Explain Microservices Through Cooking',
    category: 'Backend',
    description: 'Get AI to explain microservices architecture through a detailed cooking/recipe metaphor.',
    estimatedTime: 20,
    difficulty: 1
  },
  {
    title: 'Design Time Travel API',
    category: 'Backend',
    description: 'Design a complete API for time travel functionality, including full documentation and edge cases.',
    estimatedTime: 40,
    difficulty: 3
  },
  
  // Frontend (Thomas B)
  {
    title: 'Mind-Reading App UI Design',
    category: 'Frontend',
    description: 'Describe and design a user interface for an application that can read people\'s thoughts.',
    estimatedTime: 30,
    difficulty: 2
  },
  {
    title: 'CSS Animation as Dance Choreography',
    category: 'Frontend',
    description: 'Create a CSS animation and explain it as if it were a detailed dance choreography.',
    estimatedTime: 25,
    difficulty: 2
  },
  
  // Sales (Line)
  {
    title: 'Hogwarts IT System Proposal',
    category: 'Sales',
    description: 'Write the most convincing proposal for implementing a new IT system at Hogwarts School of Witchcraft and Wizardry.',
    estimatedTime: 35,
    difficulty: 3
  },
  {
    title: 'AI Butler for Dogs Value Proposition',
    category: 'Sales',
    description: 'Create a compelling value proposition for an AI-powered butler service specifically designed for dogs.',
    estimatedTime: 20,
    difficulty: 2
  },
  
  // Business Analysis/EA (Andreas)
  {
    title: 'Dream-Selling Business Process Map',
    category: 'Business Analysis',
    description: 'Map out a complete business process for a company that sells dreams to customers.',
    estimatedTime: 30,
    difficulty: 3
  },
  {
    title: 'Santa\'s Enterprise Architecture',
    category: 'Business Analysis',
    description: 'Design a comprehensive enterprise architecture for Santa\'s Christmas operation at the North Pole.',
    estimatedTime: 35,
    difficulty: 3
  },
  
  // BUL/Sales (Maria)
  {
    title: 'Pitch AI to 1850s Customer',
    category: 'BUL/Sales',
    description: 'Create a compelling sales pitch for AI solutions to a potential customer from the year 1850.',
    estimatedTime: 25,
    difficulty: 2
  },
  {
    title: 'Sell Sand to Desert Dweller',
    category: 'BUL/Sales',
    description: 'Use AI as your sparring partner to develop a strategy for selling sand to someone living in a desert.',
    estimatedTime: 30,
    difficulty: 3
  },
  
  // Communication/Branding (Emma)
  {
    title: 'Rebrand Nine as Superhero Organization',
    category: 'Communication',
    description: 'Use AI to rebrand Nine as a superhero organization, complete with powers, origin story, and mission.',
    estimatedTime: 30,
    difficulty: 2
  },
  {
    title: 'Make Mondays Popular Viral Campaign',
    category: 'Communication',
    description: 'Create a viral marketing campaign to make Monday the most popular day of the week.',
    estimatedTime: 25,
    difficulty: 2
  }
]

async function seedDatabase() {
  try {
    console.log('🚀 Starting database seeding...')
    
    // Test database connection
    await sequelize.authenticate()
    console.log('✅ Database connection established')
    
    // Fetch employees from Nine website
    const employees = await fetchNineEmployees()
    
    // Check if Users table exists and has data
    const [usersResult] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"')
    const userCount = parseInt(usersResult[0].count)
    
    if (userCount === 0) {
      console.log('📥 Users table is empty, inserting Nine A/S employees...')
      
      // Insert users
      const insertUserQuery = `
        INSERT INTO "Users" (id, email, name, picture, role, "isAdmin", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        ON CONFLICT (email) DO NOTHING
      `
      
      for (const employee of employees) {
        await sequelize.query(insertUserQuery, {
          bind: [
            employee.id,
            employee.email,
            employee.name,
            null, // picture
            employee.role,
            employee.isAdmin
          ]
        })
      }
      
      const [finalUsersResult] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"')
      console.log(`✅ Inserted ${finalUsersResult[0].count} employees`)
    } else {
      console.log(`ℹ️ Users table already has ${userCount} entries, skipping user seeding`)
    }
    
    // Check if Tasks table exists and has data
    const [tasksResult] = await sequelize.query('SELECT COUNT(*) as count FROM "Tasks"')
    const taskCount = parseInt(tasksResult[0].count)
    
    if (taskCount === 0) {
      console.log('📥 Tasks table is empty, inserting challenge tasks...')
      
      // Insert tasks
      const insertTaskQuery = `
        INSERT INTO "Tasks" (id, title, category, description, "estimatedTime", difficulty, "createdAt", "updatedAt")
        VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW())
      `
      
      for (const task of tasks) {
        await sequelize.query(insertTaskQuery, {
          bind: [
            task.title,
            task.category,
            task.description,
            task.estimatedTime,
            task.difficulty
          ]
        })
      }
      
      const [finalTasksResult] = await sequelize.query('SELECT COUNT(*) as count FROM "Tasks"')
      console.log(`✅ Inserted ${finalTasksResult[0].count} challenge tasks`)
    } else {
      console.log(`ℹ️ Tasks table already has ${taskCount} entries, skipping task seeding`)
    }
    
    console.log('🎉 Database seeding completed successfully!')
    
    // Summary
    const [finalUsers] = await sequelize.query('SELECT COUNT(*) as count FROM "Users"')
    const [finalTasks] = await sequelize.query('SELECT COUNT(*) as count FROM "Tasks"')
    const [finalTeams] = await sequelize.query('SELECT COUNT(*) as count FROM "Teams"')
    
    console.log('\n📊 Database Summary:')
    console.log(`   👥 Users: ${finalUsers[0].count}`)
    console.log(`   🎯 Tasks: ${finalTasks[0].count}`)
    console.log(`   👫 Teams: ${finalTeams[0].count}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  } finally {
    await sequelize.close()
    console.log('🔚 Database connection closed')
  }
}

// Run the seeding if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase()
}

export { seedDatabase }