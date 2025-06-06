#!/usr/bin/env node

/**
 * Database Seeding Script for Nine KickOff Bus Challenge
 * 
 * This script seeds the database with Nine A/S employees and challenge tasks.
 * It can be run multiple times safely - it only inserts data if tables are empty.
 * 
 * Usage:
 *   node scripts/seed-database.js
 *   npm run db:seed
 */

import { Sequelize } from 'sequelize'
import 'dotenv/config'

// Database configuration
const databaseUrl = process.env.DATABASE_URL || 'postgresql://nineuser:ninepass@localhost:5432/kickoff_challenge'

// If running inside Docker, use 'postgres' as hostname
const isDockerId = process.env.NODE_ENV === 'docker' || process.env.DATABASE_HOST === 'postgres'
const finalDatabaseUrl = isDockerId ? 
  'postgresql://nineuser:ninepass@postgres:5432/kickoff_challenge' : 
  databaseUrl

const sequelize = new Sequelize(finalDatabaseUrl, {
  dialect: 'postgres',
  logging: false, // Set to console.log to see SQL queries
})

// Nine A/S employees data - Complete list from https://nine.dk/mennesker/
// NOTE: This includes the core participants from the PRD and additional Nine employees
const employees = [
  // Key organizers/admins from PRD
  { id: 'user_jon', email: 'jsp@nine.dk', name: 'Jon Städe-Persson', role: 'Senior Consultant', isAdmin: true },
  { id: 'user_ulrik', email: 'ulrik@nine.dk', name: 'Ulrik Høyer', role: 'Senior Consultant', isAdmin: true },
  { id: 'user_thomas_b', email: 'thomas@nine.dk', name: 'Thomas Bentzen', role: 'Senior Consultant', isAdmin: true },
  { id: 'user_thor', email: 'thor@nine.dk', name: 'Thor Larsen', role: 'Senior Consultant', isAdmin: true },
  { id: 'user_emma', email: 'edr@nine.dk', name: 'Emma Dalmose Ruberg', role: 'Consultant', isAdmin: false },
  { id: 'user_line', email: 'line@nine.dk', name: 'Line Nielsen', role: 'Consultant', isAdmin: false },
  { id: 'user_maria', email: 'maria@nine.dk', name: 'Maria Hansen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_andreas', email: 'anh@nine.dk', name: 'Andreas Hollensen', role: 'Managing Consultant', isAdmin: false },
  
  // Nine A/S employees from website
  { id: 'user_aku', email: 'anv@nine.dk', name: 'Aku Nour Shirazi Valta', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_alex', email: 'aes@nine.dk', name: 'Alex Esmann', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_anders_aa', email: 'aaa@nine.dk', name: 'Anders Aaberg', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_anders_jp', email: 'ajp@nine.dk', name: 'Anders Julfeldt Petersen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_anders_mh', email: 'aha@nine.dk', name: 'Anders Mørk Hansen', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_anders_mp', email: 'amp@nine.dk', name: 'Anders Mørup-Petersen', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_anders_th', email: 'ath@nine.dk', name: 'Anders Thavlov', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_andreas_as', email: 'aas@nine.dk', name: 'Andreas Asmuss', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_andreas_sj', email: 'ase@nine.dk', name: 'Andreas Stensig Jensen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_anna', email: 'anna@nine.dk', name: 'Anna Kato Ipsen', role: 'Consultant', isAdmin: false },
  { id: 'user_anne', email: 'anne@nine.dk', name: 'Anne Tegllund Blaabjerg', role: 'Consultant', isAdmin: false },
  { id: 'user_annette', email: 'annette@nine.dk', name: 'Annette Ibsen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_beatrice', email: 'beatrice@nine.dk', name: 'Beatrice Skov Hansen', role: 'Consultant', isAdmin: false },
  { id: 'user_benedicte', email: 'benedicte@nine.dk', name: 'Benedicte Lumby Jessen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_bjarne_bj', email: 'bjarne.bj@nine.dk', name: 'Bjarne Bue Jensen', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_bjarne_g', email: 'bjarne.g@nine.dk', name: 'Bjarne Glerup', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_brian', email: 'brian@nine.dk', name: 'Brian Westy Rasmussen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_carsten', email: 'carsten@nine.dk', name: 'Carsten Ejlersen', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_casper_h', email: 'casper.h@nine.dk', name: 'Casper Bertel Rye Hintze', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_casper_n', email: 'casper.n@nine.dk', name: 'Casper Ingstrup Nielsen', role: 'Consultant', isAdmin: false },
  { id: 'user_casper_j', email: 'casper.j@nine.dk', name: 'Casper Lund Junge', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_cecilie_f', email: 'cecilie.f@nine.dk', name: 'Cecilie Frick', role: 'Consultant', isAdmin: false },
  { id: 'user_cecilie_v', email: 'cecilie.v@nine.dk', name: 'Cecilie Vedel', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_chanette', email: 'chanette@nine.dk', name: 'Chanette Lind Tamminen', role: 'Consultant', isAdmin: false },
  { id: 'user_christian', email: 'christian@nine.dk', name: 'Christian Landbo', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_christie', email: 'christie@nine.dk', name: 'Christie Holm Schmidt', role: 'Consultant', isAdmin: false },
  { id: 'user_christina', email: 'christina@nine.dk', name: 'Christina Hirsbak', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_christine', email: 'christine@nine.dk', name: 'Christine Eis Christensen', role: 'Consultant', isAdmin: false },
  { id: 'user_claus_c', email: 'claus.c@nine.dk', name: 'Claus Crifling', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_claus_n', email: 'claus.n@nine.dk', name: 'Claus Nordahl', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_claus_vb', email: 'claus.vb@nine.dk', name: 'Claus Von Bülow', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_daniel_d', email: 'daniel.d@nine.dk', name: 'Daniel Demus', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_daniel_h', email: 'daniel.h@nine.dk', name: 'Daniel Hammer', role: 'Consultant', isAdmin: false },
  { id: 'user_david', email: 'david@nine.dk', name: 'David Elvekjær', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_dorte', email: 'dorte@nine.dk', name: 'Dorte Levy', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_elke', email: 'elke@nine.dk', name: 'Elke Hartvig', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_erik_r', email: 'erik.r@nine.dk', name: 'Erik Rasmussen', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_erik_z', email: 'erik.z@nine.dk', name: 'Erik Zielke', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_erla', email: 'erla@nine.dk', name: 'Erla Raskov', role: 'Consultant', isAdmin: false },
  { id: 'user_firat', email: 'firat@nine.dk', name: 'Firat Acar', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_heidi', email: 'heidi@nine.dk', name: 'Heidi Holstein', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_helle_h', email: 'helle.h@nine.dk', name: 'Helle Hølmer', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_helle_i', email: 'helle.i@nine.dk', name: 'Helle Oest Iversen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_henrik', email: 'henrik@nine.dk', name: 'Henrik Martinussen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_ismail', email: 'ismail@nine.dk', name: 'Ismail Cam', role: 'Consultant', isAdmin: false },
  { id: 'user_jacob', email: 'jacob@nine.dk', name: 'Jacob Strange', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jakob', email: 'jakob@nine.dk', name: 'Jakob Broesbøl-Jensen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jan', email: 'jan@nine.dk', name: 'Jan Bentzen', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_jarl', email: 'jarl@nine.dk', name: 'Jarl Munkstrup', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jean', email: 'jean@nine.dk', name: 'Jean Loberg Hansen', role: 'Consultant', isAdmin: false },
  { id: 'user_jens_cc', email: 'jens.cc@nine.dk', name: 'Jens Christian Christiansen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jens_k', email: 'jens.k@nine.dk', name: 'Jens Karlsmose', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_jens_l', email: 'jens.l@nine.dk', name: 'Jens Lohmann', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_jesper_ln', email: 'jesper.ln@nine.dk', name: 'Jesper Loose Nielsen', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jesper_lu', email: 'jesper.lu@nine.dk', name: 'Jesper Lundsgaard', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_jesper_rj', email: 'jesper.rj@nine.dk', name: 'Jesper Rønn-Jensen', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_jesper_sm', email: 'jesper.sm@nine.dk', name: 'Jesper Steen Møller', role: 'Principal Consultant', isAdmin: false },
  { id: 'user_johan', email: 'johan@nine.dk', name: 'Johan Utzon', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jonas_nj', email: 'jonas.nj@nine.dk', name: 'Jonas Nowak Jørgensen', role: 'Consultant', isAdmin: false },
  { id: 'user_jonas_p', email: 'jonas.p@nine.dk', name: 'Jonas Puidokas', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_jonathan', email: 'jonathan@nine.dk', name: 'Jonathan Szigethy', role: 'Consultant', isAdmin: false },
  { id: 'user_jorgen', email: 'jorgen@nine.dk', name: 'Jørgen Mortensen', role: 'Managing Consultant', isAdmin: false },
  { id: 'user_kenneth_r', email: 'kenneth.r@nine.dk', name: 'Kenneth Gerald Ronge', role: 'Senior Consultant', isAdmin: false },
  { id: 'user_kenneth_ro', email: 'kenneth.ro@nine.dk', name: 'Kenneth Rørstrø', role: 'Principal Consultant', isAdmin: false }
]

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