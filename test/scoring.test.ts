import { describe, it, expect } from 'vitest'
import {
  calculateSubmissionScore,
  calculateTeamScore,
  sortTeamsByScore,
  formatScoreDisplay,
  type TeamScore,
} from '~/server/utils/scoring'

describe('Scoring System', () => {
  describe('calculateSubmissionScore', () => {
    it('should calculate score correctly for rated submissions', () => {
      expect(calculateSubmissionScore(1, 5)).toBe(5) // Easy task, 5 stars = 5 points
      expect(calculateSubmissionScore(2, 4)).toBe(8) // Medium task, 4 stars = 8 points
      expect(calculateSubmissionScore(3, 2)).toBe(6) // Hard task, 2 stars = 6 points
      expect(calculateSubmissionScore(1, 1)).toBe(1) // Easy task, 1 star = 1 point
      expect(calculateSubmissionScore(3, 5)).toBe(15) // Hard task, 5 stars = 15 points
    })

    it('should return 0 for unrated submissions', () => {
      expect(calculateSubmissionScore(1, null)).toBe(0)
      expect(calculateSubmissionScore(2, null)).toBe(0)
      expect(calculateSubmissionScore(3, null)).toBe(0)
      expect(calculateSubmissionScore(1, undefined as any)).toBe(0)
    })

    it('should handle edge case ratings', () => {
      expect(calculateSubmissionScore(2, 0)).toBe(0) // 0 rating = 0 points
      expect(calculateSubmissionScore(3, 1.5)).toBe(4.5) // Decimal rating
    })
  })

  describe('calculateTeamScore', () => {
    it('should calculate team score with all rated submissions', () => {
      const submissions = [
        {
          id: 'sub1',
          task: { title: 'Easy Task', difficulty: 1 },
          rating: 4,
        },
        {
          id: 'sub2',
          task: { title: 'Medium Task', difficulty: 2 },
          rating: 5,
        },
        {
          id: 'sub3',
          task: { title: 'Hard Task', difficulty: 3 },
          rating: 3,
        },
      ]

      const result = calculateTeamScore(submissions)

      // Expected scores: 1×4 + 2×5 + 3×3 = 4 + 10 + 9 = 23
      expect(result.totalScore).toBe(23)
      expect(result.completedCount).toBe(3)
      expect(result.ratedCount).toBe(3)
      expect(result.unratedCount).toBe(0)
      expect(result.averageRating).toBe(4) // (4+5+3)/3 = 4
      expect(result.averageDifficulty).toBe(2) // (1+2+3)/3 = 2
    })

    it('should handle team with unrated submissions', () => {
      const submissions = [
        {
          id: 'sub1',
          task: { title: 'Easy Task', difficulty: 1 },
          rating: 5,
        },
        {
          id: 'sub2',
          task: { title: 'Medium Task', difficulty: 2 },
          rating: null,
        },
        {
          id: 'sub3',
          task: { title: 'Hard Task', difficulty: 3 },
          rating: 4,
        },
      ]

      const result = calculateTeamScore(submissions)

      // Expected scores: 1×5 + 2×0 + 3×4 = 5 + 0 + 12 = 17
      expect(result.totalScore).toBe(17)
      expect(result.completedCount).toBe(3)
      expect(result.ratedCount).toBe(2)
      expect(result.unratedCount).toBe(1)
      expect(result.averageRating).toBe(4.5) // (5+4)/2 = 4.5
      expect(result.averageDifficulty).toBe(2) // (1+2+3)/3 = 2
    })

    it('should handle team with no rated submissions', () => {
      const submissions = [
        {
          id: 'sub1',
          task: { title: 'Easy Task', difficulty: 1 },
          rating: null,
        },
        {
          id: 'sub2',
          task: { title: 'Medium Task', difficulty: 2 },
          rating: null,
        },
      ]

      const result = calculateTeamScore(submissions)

      expect(result.totalScore).toBe(0)
      expect(result.completedCount).toBe(2)
      expect(result.ratedCount).toBe(0)
      expect(result.unratedCount).toBe(2)
      expect(result.averageRating).toBe(0)
      expect(result.averageDifficulty).toBe(1.5) // (1+2)/2 = 1.5
    })

    it('should handle empty submissions', () => {
      const result = calculateTeamScore([])

      expect(result.totalScore).toBe(0)
      expect(result.completedCount).toBe(0)
      expect(result.ratedCount).toBe(0)
      expect(result.unratedCount).toBe(0)
      expect(result.averageRating).toBe(0)
      expect(result.averageDifficulty).toBe(0)
    })

    it('should properly round decimal results', () => {
      const submissions = [
        {
          id: 'sub1',
          task: { title: 'Task 1', difficulty: 1 },
          rating: 3.33,
        },
        {
          id: 'sub2',
          task: { title: 'Task 2', difficulty: 2 },
          rating: 4.67,
        },
      ]

      const result = calculateTeamScore(submissions)

      // Expected: 1×3.33 + 2×4.67 = 3.33 + 9.34 = 12.67 → 12.7
      expect(result.totalScore).toBe(12.7)
      expect(result.averageRating).toBe(4) // (3.33+4.67)/2 = 4.0
    })
  })

  describe('sortTeamsByScore', () => {
    const createMockTeam = (
      name: string,
      totalScore: number,
      completedCount: number,
      averageRating: number
    ): TeamScore => ({
      teamId: `team-${name}`,
      teamName: name,
      submissions: [],
      totalScore,
      completedCount,
      ratedCount: completedCount,
      unratedCount: 0,
      averageRating,
      averageDifficulty: 2,
    })

    it('should sort teams by total score descending', () => {
      const teams = [
        createMockTeam('Team B', 15, 3, 4),
        createMockTeam('Team A', 20, 2, 5),
        createMockTeam('Team C', 10, 4, 3),
      ]

      const sorted = sortTeamsByScore(teams)

      expect(sorted[0].teamName).toBe('Team A') // 20 points
      expect(sorted[1].teamName).toBe('Team B') // 15 points
      expect(sorted[2].teamName).toBe('Team C') // 10 points
    })

    it('should use completed count as tiebreaker', () => {
      const teams = [
        createMockTeam('Team B', 15, 2, 4),
        createMockTeam('Team A', 15, 3, 4),
        createMockTeam('Team C', 15, 1, 4),
      ]

      const sorted = sortTeamsByScore(teams)

      expect(sorted[0].teamName).toBe('Team A') // 3 completed
      expect(sorted[1].teamName).toBe('Team B') // 2 completed
      expect(sorted[2].teamName).toBe('Team C') // 1 completed
    })

    it('should use average rating as secondary tiebreaker', () => {
      const teams = [
        createMockTeam('Team B', 15, 3, 3.5),
        createMockTeam('Team A', 15, 3, 4.5),
        createMockTeam('Team C', 15, 3, 2.5),
      ]

      const sorted = sortTeamsByScore(teams)

      expect(sorted[0].teamName).toBe('Team A') // 4.5 avg rating
      expect(sorted[1].teamName).toBe('Team B') // 3.5 avg rating
      expect(sorted[2].teamName).toBe('Team C') // 2.5 avg rating
    })
  })

  describe('formatScoreDisplay', () => {
    const createMockTeamScore = (
      completedCount: number,
      ratedCount: number,
      averageRating: number
    ): TeamScore => ({
      teamId: 'team-1',
      teamName: 'Test Team',
      submissions: [],
      totalScore: 20,
      completedCount,
      ratedCount,
      unratedCount: completedCount - ratedCount,
      averageRating,
      averageDifficulty: 2,
    })

    it('should format display for fully rated team', () => {
      const teamScore = createMockTeamScore(3, 3, 4.5)
      const result = formatScoreDisplay(teamScore)

      expect(result.totalScore).toBe('20')
      expect(result.breakdown).toBe('3 completed × 4.5⭐ avg')
      expect(result.details).toBe('')
    })

    it('should format display for partially rated team', () => {
      const teamScore = createMockTeamScore(4, 2, 4.0)
      const result = formatScoreDisplay(teamScore)

      expect(result.totalScore).toBe('20')
      expect(result.breakdown).toBe('4 completed × 4⭐ avg')
      expect(result.details).toBe('2 awaiting rating')
    })

    it('should format display for unrated team', () => {
      const teamScore = createMockTeamScore(2, 0, 0)
      const result = formatScoreDisplay(teamScore)

      expect(result.totalScore).toBe('20')
      expect(result.breakdown).toBe('2 completed')
      expect(result.details).toBe('2 awaiting rating')
    })

    it('should handle zero average rating gracefully', () => {
      const teamScore = createMockTeamScore(3, 3, 0)
      const result = formatScoreDisplay(teamScore)

      expect(result.breakdown).toBe('3 completed') // Should not show "× 0⭐ avg"
    })

    it('should handle single submission', () => {
      const teamScore = createMockTeamScore(1, 1, 5)
      const result = formatScoreDisplay(teamScore)

      expect(result.breakdown).toBe('1 completed × 5⭐ avg')
      expect(result.details).toBe('')
    })
  })

  describe('Integration Tests', () => {
    it('should handle realistic competition scenario', () => {
      // Team Alpha: 2 medium tasks well executed
      const teamAlpha = calculateTeamScore([
        { id: 'a1', task: { title: 'PM Task', difficulty: 2 }, rating: 5 },
        { id: 'a2', task: { title: 'Frontend Task', difficulty: 2 }, rating: 4 },
      ])

      // Team Beta: 3 tasks mixed difficulty, one unrated
      const teamBeta = calculateTeamScore([
        { id: 'b1', task: { title: 'Easy Task', difficulty: 1 }, rating: 5 },
        { id: 'b2', task: { title: 'Hard Task', difficulty: 3 }, rating: 3 },
        { id: 'b3', task: { title: 'Medium Task', difficulty: 2 }, rating: null },
      ])

      // Team Gamma: 1 hard task perfectly executed
      const teamGamma = calculateTeamScore([
        { id: 'g1', task: { title: 'Hard Task', difficulty: 3 }, rating: 5 },
      ])

      // Team Alpha: 2×5 + 2×4 = 18 points
      expect(teamAlpha.totalScore).toBe(18)
      expect(teamAlpha.averageRating).toBe(4.5)

      // Team Beta: 1×5 + 3×3 + 2×0 = 14 points
      expect(teamBeta.totalScore).toBe(14)
      expect(teamBeta.averageRating).toBe(4) // (5+3)/2

      // Team Gamma: 3×5 = 15 points
      expect(teamGamma.totalScore).toBe(15)
      expect(teamGamma.averageRating).toBe(5)

      // Sort teams
      const teams = [teamAlpha, teamBeta, teamGamma].map((team, index) => ({
        ...team,
        teamId: `team-${index}`,
        teamName: ['Alpha', 'Beta', 'Gamma'][index],
      }))

      const sorted = sortTeamsByScore(teams)

      // Expected order: Alpha (18), Gamma (15), Beta (14)
      expect(sorted[0].teamName).toBe('Alpha')
      expect(sorted[1].teamName).toBe('Gamma')
      expect(sorted[2].teamName).toBe('Beta')
    })

    it('should demonstrate difficulty-based scoring advantage', () => {
      // Team Easy: 3 easy tasks with perfect scores
      const teamEasy = calculateTeamScore([
        { id: 'e1', task: { title: 'Easy 1', difficulty: 1 }, rating: 5 },
        { id: 'e2', task: { title: 'Easy 2', difficulty: 1 }, rating: 5 },
        { id: 'e3', task: { title: 'Easy 3', difficulty: 1 }, rating: 5 },
      ])

      // Team Hard: 1 hard task with perfect score
      const teamHard = calculateTeamScore([
        { id: 'h1', task: { title: 'Hard 1', difficulty: 3 }, rating: 5 },
      ])

      // Team Easy: 3×(1×5) = 15 points
      expect(teamEasy.totalScore).toBe(15)

      // Team Hard: 1×(3×5) = 15 points
      expect(teamHard.totalScore).toBe(15)

      // Both teams tied! This shows the scoring system balances
      // quantity vs difficulty appropriately
      expect(teamEasy.totalScore).toBe(teamHard.totalScore)
    })
  })
})
