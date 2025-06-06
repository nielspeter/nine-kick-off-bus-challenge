#!/usr/bin/env node

/**
 * Generate SQL seed file from Nine A/S website
 * 
 * This script fetches employee data from nine.dk/mennesker/ and generates SQL
 * that can be used to seed the database with all employees and challenge tasks.
 * 
 * Usage:
 *   node scripts/generate-seed-sql.js > database/seed.sql
 *   npm run generate:seed
 */

import { JSDOM } from 'jsdom'
import fs from 'fs'

// Fetch employees from Nine website
async function fetchNineEmployees() {
  try {
    console.error('🌐 Fetching employees from nine.dk/mennesker/...')
    
    const response = await fetch('https://nine.dk/mennesker/')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const html = await response.text()
    
    // Extract email addresses from the HTML
    const emailRegex = /([a-zA-Z0-9._%+-]+@nine\.dk)/g
    const emails = [...html.matchAll(emailRegex)].map(match => match[1])
    
    // Extract names using a more comprehensive approach
    // Look for name patterns in different contexts
    const namePatterns = [
      /"name":\s*"([^"]+)"/g,  // JSON name field
      /"([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)"/g,  // Quoted full names
      />([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)</g,  // HTML content names
      /alt="([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)"/g,  // Alt text
      /title="([A-ZÆØÅ][a-zæøå]+(?:\s+[A-ZÆØÅ][a-zæøå]+)+)"/g  // Title attributes
    ]
    
    let names = []
    for (const pattern of namePatterns) {
      const matches = [...html.matchAll(pattern)].map(match => match[1])
      names.push(...matches)
      if (names.length > 50) break // Stop if we have enough names
    }
    
    // Try to extract from JSON-LD or structured data
    const jsonLdRegex = /<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs
    const jsonMatches = [...html.matchAll(jsonLdRegex)]
    
    for (const match of jsonMatches) {
      try {
        const data = JSON.parse(match[1])
        if (data.employees || data['@type'] === 'Person') {
          console.error('Found structured data with employee info')
        }
      } catch (e) {
        // Ignore invalid JSON
      }
    }
    
    console.error(`📧 Found ${emails.length} email addresses`)
    console.error(`👤 Found ${names.length} names`)
    
    const uniqueEmails = [...new Set(emails)]
    const uniqueNames = [...new Set(names.filter(name => 
      name.length > 3 && 
      name.includes(' ') && 
      !name.includes('@') &&
      !/\d/.test(name) // No numbers in names
    ))]
    
    console.error(`📧 Unique emails: ${uniqueEmails.length}`)
    console.error(`👤 Unique names: ${uniqueNames.length}`)
    
    // Create employee objects
    const employees = []
    const maxLength = Math.max(uniqueEmails.length, uniqueNames.length)
    
    for (let i = 0; i < maxLength; i++) {
      const email = uniqueEmails[i]
      const name = uniqueNames[i] || null
      
      if (email) {
        // Generate ID from email
        const id = 'user_' + email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_')
        
        // Determine role and admin status
        const isAdmin = ['jsp@nine.dk', 'ulrik@nine.dk', 'thomas@nine.dk', 'thor@nine.dk'].includes(email)
        
        // Try to determine role from common patterns
        let role = 'Consultant'
        if (email.includes('senior') || email.includes('sr')) {
          role = 'Senior Consultant'
        } else if (email.includes('principal') || email.includes('lead')) {
          role = 'Principal Consultant'
        } else if (email.includes('manager') || email.includes('mgr')) {
          role = 'Managing Consultant'
        }
        
        if (isAdmin) {
          role = 'Senior Consultant' // Admins are senior consultants
        }
        
        employees.push({
          id,
          email,
          name: name || extractNameFromEmail(email),
          role,
          isAdmin
        })
      }
    }
    
    // Map emails to proper names using known mappings
    const knownNameMappings = {
      'anv@nine.dk': 'Aku Nour Shirazi Valta',
      'aes@nine.dk': 'Alex Esmann', 
      'aaa@nine.dk': 'Anders Aaberg',
      'ajp@nine.dk': 'Anders Julfeldt Petersen',
      'aha@nine.dk': 'Anders Mørk Hansen',
      'amp@nine.dk': 'Anders Mørup-Petersen',
      'ath@nine.dk': 'Anders Thavlov',
      'aas@nine.dk': 'Andreas Asmuss',
      'anh@nine.dk': 'Andreas Hollensen',
      'ase@nine.dk': 'Andreas Stensig Jensen',
      'aki@nine.dk': 'Anna Kato Ipsen',
      'atb@nine.dk': 'Anne Tegllund Blaabjerg',
      'aib@nine.dk': 'Annette Ibsen',
      'bsh@nine.dk': 'Beatrice Skov Hansen',
      'blj@nine.dk': 'Benedicte Lumby Jessen',
      'bbj@nine.dk': 'Bjarne Bue Jensen',
      'bgl@nine.dk': 'Bjarne Glerup',
      'bwr@nine.dk': 'Brian Westy Rasmussen',
      'cej@nine.dk': 'Carsten Ejlersen',
      'cbh@nine.dk': 'Casper Bertel Rye Hintze',
      'cin@nine.dk': 'Casper Ingstrup Nielsen',
      'clj@nine.dk': 'Casper Lund Junge',
      'cef@nine.dk': 'Cecilie Frick',
      'cev@nine.dk': 'Cecilie Vedel',
      'cla@nine.dk': 'Chanette Lind Tamminen',
      'csc@nine.dk': 'Christie Holm Schmidt',
      'chi@nine.dk': 'Christina Hirsbak',
      'cec@nine.dk': 'Christine Eis Christensen',
      'cri@nine.dk': 'Claus Crifling',
      'cnn@nine.dk': 'Claus Nordahl',
      'cvb@nine.dk': 'Claus Von Bülow',
      'dde@nine.dk': 'Daniel Demus',
      'deh@nine.dk': 'Daniel Hammer',
      'del@nine.dk': 'David Elvekjær',
      'dwl@nine.dk': 'Dorte Levy',
      'eha@nine.dk': 'Elke Hartvig',
      'edr@nine.dk': 'Emma Dalmose Ruberg',
      'ewr@nine.dk': 'Erik Rasmussen',
      'ezi@nine.dk': 'Erik Zielke',
      'era@nine.dk': 'Erla Raskov',
      'fia@nine.dk': 'Firat Acar',
      'hho@nine.dk': 'Heidi Holstein',
      'heh@nine.dk': 'Helle Hølmer',
      'hoi@nine.dk': 'Helle Oest Iversen',
      'hma@nine.dk': 'Henrik Martinussen',
      'ism@nine.dk': 'Ismail Cam',
      'jst@nine.dk': 'Jacob Strange',
      'jbr@nine.dk': 'Jakob Broesbøl-Jensen',
      'jbe@nine.dk': 'Jan Bentzen',
      'jmu@nine.dk': 'Jarl Munkstrup',
      'jlh@nine.dk': 'Jean Loberg Hansen',
      'jcc@nine.dk': 'Jens Christian Christiansen',
      'jk@nine.dk': 'Jens Karlsmose',
      'jlo@nine.dk': 'Jens Lohmann',
      'jln@nine.dk': 'Jesper Loose Nielsen',
      'jel@nine.dk': 'Jesper Lundsgaard',
      'jrj@nine.dk': 'Jesper Rønn-Jensen',
      'jsm@nine.dk': 'Jesper Steen Møller',
      'jja@nine.dk': 'Johan Utzon',
      'jsp@nine.dk': 'Jon Städe-Persson',
      'jnj@nine.dk': 'Jonas Nowak Jørgensen',
      'jpu@nine.dk': 'Jonas Puidokas',
      'jsz@nine.dk': 'Jonathan Szigethy',
      'jmo@nine.dk': 'Jørgen Mortensen',
      'kgr@nine.dk': 'Kenneth Gerald Ronge',
      'kro@nine.dk': 'Kenneth Rørstrø'
    }
    
    // Update employee names using known mappings
    for (const employee of employees) {
      const knownName = knownNameMappings[employee.email]
      if (knownName) {
        employee.name = knownName
      }
    }
    
    console.error(`✅ Generated ${employees.length} employee records`)
    return employees
    
  } catch (error) {
    console.error('❌ Error fetching employees:', error)
    return getFallbackEmployees()
  }
}

function extractNameFromEmail(email) {
  const username = email.split('@')[0]
  // Convert common patterns like "first.last" to "First Last"
  return username
    .split(/[._-]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')
}

// Fallback employees list
function getFallbackEmployees() {
  console.error('🔄 Using fallback employee list...')
  return [
    { id: 'user_jon', email: 'jsp@nine.dk', name: 'Jon Städe-Persson', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_ulrik', email: 'ulrik@nine.dk', name: 'Ulrik Høyer', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_thomas_b', email: 'thomas@nine.dk', name: 'Thomas Bentzen', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_thor', email: 'thor@nine.dk', name: 'Thor Larsen', role: 'Senior Consultant', isAdmin: true },
    { id: 'user_emma', email: 'edr@nine.dk', name: 'Emma Dalmose Ruberg', role: 'Consultant', isAdmin: false },
    { id: 'user_andreas', email: 'anh@nine.dk', name: 'Andreas Hollensen', role: 'Managing Consultant', isAdmin: false }
  ]
}

// Challenge tasks data
const tasks = [
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

function escapeSQL(str) {
  if (!str) return 'NULL'
  return `'${str.replace(/'/g, "''")}'`
}

async function generateSQL() {
  console.error('🚀 Generating SQL seed file...')
  
  const employees = await fetchNineEmployees()
  
  let sql = `-- Nine KickOff Bus Challenge - Database Seed
-- Generated on ${new Date().toISOString()}
-- Total employees: ${employees.length}

\\c kickoff_challenge;

-- Ensure tables exist
CREATE TABLE IF NOT EXISTS "Users" (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    picture VARCHAR(255),
    role VARCHAR(255),
    "isAdmin" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Tasks" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    "estimatedTime" INTEGER NOT NULL,
    difficulty INTEGER DEFAULT 1 CHECK (difficulty >= 1 AND difficulty <= 3),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clear existing data (optional - remove if you want to keep existing data)
-- DELETE FROM "Users";
-- DELETE FROM "Tasks";

-- Insert Users
INSERT INTO "Users" (id, email, name, picture, role, "isAdmin", "createdAt", "updatedAt") VALUES
`

  // Generate user INSERT statements
  const userValues = employees.map(emp => 
    `(${escapeSQL(emp.id)}, ${escapeSQL(emp.email)}, ${escapeSQL(emp.name)}, NULL, ${escapeSQL(emp.role)}, ${emp.isAdmin}, NOW(), NOW())`
  ).join(',\n')
  
  sql += userValues + '\nON CONFLICT (email) DO UPDATE SET\n'
  sql += '  name = EXCLUDED.name,\n'
  sql += '  role = EXCLUDED.role,\n'
  sql += '  "isAdmin" = EXCLUDED."isAdmin",\n'
  sql += '  "updatedAt" = NOW();\n\n'
  
  // Insert Tasks
  sql += `-- Insert Tasks
INSERT INTO "Tasks" (title, category, description, "estimatedTime", difficulty, "createdAt", "updatedAt") VALUES
`
  
  const taskValues = tasks.map(task => 
    `(${escapeSQL(task.title)}, ${escapeSQL(task.category)}, ${escapeSQL(task.description)}, ${task.estimatedTime}, ${task.difficulty}, NOW(), NOW())`
  ).join(',\n')
  
  sql += taskValues + '\nON CONFLICT (title) DO NOTHING;\n\n'
  
  // Final summary
  sql += `-- Summary
-- Users inserted: ${employees.length}
-- Tasks inserted: ${tasks.length}
-- Generated at: ${new Date().toISOString()}

SELECT 
  (SELECT COUNT(*) FROM "Users") as users_count,
  (SELECT COUNT(*) FROM "Tasks") as tasks_count,
  (SELECT COUNT(*) FROM "Users" WHERE "isAdmin" = true) as admin_count;
`

  console.error('✅ SQL generation completed')
  console.error(`📊 Generated SQL for ${employees.length} users and ${tasks.length} tasks`)
  
  return sql
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSQL().then(sql => {
    console.log(sql) // Output to stdout
  }).catch(error => {
    console.error('❌ Error generating SQL:', error)
    process.exit(1)
  })
}

export { generateSQL }