#!/usr/bin/env node
import { load } from 'cheerio'
import { URL } from 'url'
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

// Fetch employees from Nine website
async function fetchNineEmployees() {
  const pageUrl = 'https://nine.dk/mennesker/'

  try {
    const res = await fetch(pageUrl)
    if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`)
    const html = await res.text()
    const $ = load(html)

    const users = []

    $('.single-person').each((i, el) => {
      const name = $(el).find('.single-person-details h3').text().trim()
      const role = $(el).find('.single-person-details p').text().trim() || null

      // first image in the image-contained block is the real portrait
      const imgSrc = $(el).find('.image-contained img.image').attr('src')
      const picture = imgSrc ? new URL(imgSrc, pageUrl).href : null

      // first mailto link, if any
      const mailHref = $(el).find('a[href^="mailto:"]').attr('href')
      const email = mailHref ? mailHref.replace(/^mailto:/, '').trim() : null

      // Generate ID from email prefix if available, otherwise use index
      let id
      if (email) {
        const emailPrefix = email.split('@')[0]
        id = `user_${emailPrefix}`
      } else {
        id = `user_nine_${i}`
      }

      // Skip if we don't have essential data
      if (!name || !email) {
        console.error(
          `Skipping person ${i}: missing name or email (name: "${name}", email: "${email}")`
        )
        return
      }

      users.push({
        id,
        email,
        name,
        picture,
        role,
        isAdmin: false, // Default to non-admin for scraped users
      })
    })
    return users
  } catch (err) {
    console.error('Error:', err)
    process.exit(1)
  }
}

// Challenge tasks data
const tasks = [
  {
    title: 'Design Creative Test Cases for Pet Dating App',
    category: 'Test',
    description:
      'Use AI to design the most creative test cases for a dating app specifically for pets. Think outside the box!',
    estimatedTime: 25,
    difficulty: 2,
  },
  {
    title: 'Generate Edge-Case Scenarios for Smart Elevator',
    category: 'Test',
    description:
      'Get AI to generate the most amusing and unexpected edge-case scenarios for a smart elevator system.',
    estimatedTime: 20,
    difficulty: 2,
  },
  {
    title: 'Create Ultimate Sprint Retrospective Format',
    category: 'Project Management',
    description:
      "Design the world's most motivating and effective sprint retrospective format using AI creativity.",
    estimatedTime: 30,
    difficulty: 2,
  },
  {
    title: 'AI-Assisted Difficult Stakeholder Management',
    category: 'Project Management',
    description:
      'Design an AI-assisted methodology for handling the most challenging stakeholders in projects.',
    estimatedTime: 35,
    difficulty: 3,
  },
  {
    title: 'Explain Microservices Through Cooking',
    category: 'Backend',
    description:
      'Get AI to explain microservices architecture through a detailed cooking/recipe metaphor.',
    estimatedTime: 20,
    difficulty: 1,
  },
  {
    title: 'Design Time Travel API',
    category: 'Backend',
    description:
      'Design a complete API for time travel functionality, including full documentation and edge cases.',
    estimatedTime: 40,
    difficulty: 3,
  },
  {
    title: 'Mind-Reading App UI Design',
    category: 'Frontend',
    description:
      "Describe and design a user interface for an application that can read people's thoughts.",
    estimatedTime: 30,
    difficulty: 2,
  },
  {
    title: 'CSS Animation as Dance Choreography',
    category: 'Frontend',
    description:
      'Create a CSS animation and explain it as if it were a detailed dance choreography.',
    estimatedTime: 25,
    difficulty: 2,
  },
  {
    title: 'Hogwarts IT System Proposal',
    category: 'Sales',
    description:
      'Write the most convincing proposal for implementing a new IT system at Hogwarts School of Witchcraft and Wizardry.',
    estimatedTime: 35,
    difficulty: 3,
  },
  {
    title: 'AI Butler for Dogs Value Proposition',
    category: 'Sales',
    description:
      'Create a compelling value proposition for an AI-powered butler service specifically designed for dogs.',
    estimatedTime: 20,
    difficulty: 2,
  },
  {
    title: 'Dream-Selling Business Process Map',
    category: 'Business Analysis',
    description:
      'Map out a complete business process for a company that sells dreams to customers.',
    estimatedTime: 30,
    difficulty: 3,
  },
  {
    title: "Santa's Enterprise Architecture",
    category: 'Business Analysis',
    description:
      "Design a comprehensive enterprise architecture for Santa's Christmas operation at the North Pole.",
    estimatedTime: 35,
    difficulty: 3,
  },
  {
    title: 'Pitch AI to 1850s Customer',
    category: 'BUL/Sales',
    description:
      'Create a compelling sales pitch for AI solutions to a potential customer from the year 1850.',
    estimatedTime: 25,
    difficulty: 2,
  },
  {
    title: 'Sell Sand to Desert Dweller',
    category: 'BUL/Sales',
    description:
      'Use AI as your sparring partner to develop a strategy for selling sand to someone living in a desert.',
    estimatedTime: 30,
    difficulty: 3,
  },
  {
    title: 'Rebrand Nine as Superhero Organization',
    category: 'Communication',
    description:
      'Use AI to rebrand Nine as a superhero organization, complete with powers, origin story, and mission.',
    estimatedTime: 30,
    difficulty: 2,
  },
  {
    title: 'Make Mondays Popular Viral Campaign',
    category: 'Communication',
    description:
      'Create a viral marketing campaign to make Monday the most popular day of the week.',
    estimatedTime: 25,
    difficulty: 2,
  },
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
  const userValues = employees
    .map(
      emp =>
        `(${escapeSQL(emp.id)}, ${escapeSQL(emp.email)}, ${escapeSQL(emp.name)}, ${escapeSQL(emp.picture)}, ${escapeSQL(emp.role)}, ${emp.isAdmin}, NOW(), NOW())`
    )
    .join(',\n')

  sql += userValues + '\nON CONFLICT (email) DO UPDATE SET\n'
  sql += '  name = EXCLUDED.name,\n'
  sql += '  picture = EXCLUDED.picture,\n'
  sql += '  role = EXCLUDED.role,\n'
  sql += '  "isAdmin" = EXCLUDED."isAdmin",\n'
  sql += '  "updatedAt" = NOW();\n\n'

  // Insert Tasks
  sql += `-- Insert Tasks
INSERT INTO "Tasks" (title, category, description, "estimatedTime", difficulty, "createdAt", "updatedAt") VALUES
`

  const taskValues = tasks
    .map(
      task =>
        `(${escapeSQL(task.title)}, ${escapeSQL(task.category)}, ${escapeSQL(task.description)}, ${task.estimatedTime}, ${task.difficulty}, NOW(), NOW())`
    )
    .join(',\n')

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
  generateSQL()
    .then(sql => {
      console.log(sql) // Output to stdout
    })
    .catch(error => {
      console.error('❌ Error generating SQL:', error)
      process.exit(1)
    })
}

export { generateSQL }
