/**
 * Competition Scoring System
 *
 * This module handles all score calculations for the Nine KickOff Bus Challenge.
 *
 * ## Scoring Formula
 *
 * **Individual Submission Score:**
 * ```
 * Submission Score = Task Difficulty × Star Rating
 * ```
 *
 * **Team Total Score:**
 * ```
 * Total Score = Σ(Task Difficulty × Star Rating) for all completed & rated submissions
 * ```
 *
 * ## Examples:
 * - Easy task (difficulty 1) with 5⭐ rating = 1 × 5 = 5 points
 * - Medium task (difficulty 2) with 4⭐ rating = 2 × 4 = 8 points
 * - Hard task (difficulty 3) with 2⭐ rating = 3 × 2 = 6 points
 *
 * ## Unrated Submissions:
 * - Completed but unrated submissions do not contribute to the total score
 * - This encourages quality over speed and ensures manual judging is completed
 *
 * ## Difficulty Levels:
 * - 1 = Easy (base multiplier)
 * - 2 = Medium (2x multiplier)
 * - 3 = Hard (3x multiplier)
 *
 * ## Star Rating Scale:
 * - 1⭐ = Poor quality
 * - 2⭐ = Below average
 * - 3⭐ = Average quality
 * - 4⭐ = Good quality
 * - 5⭐ = Excellent quality
 */

export interface SubmissionScore {
  submissionId: string
  taskTitle: string
  difficulty: number
  rating: number | null
  score: number
  isRated: boolean
}

export interface TeamScore {
  teamId: string
  teamName: string
  submissions: SubmissionScore[]
  totalScore: number
  completedCount: number
  ratedCount: number
  unratedCount: number
  averageRating: number
  averageDifficulty: number
}

/**
 * Calculate score for a single submission
 */
export function calculateSubmissionScore(difficulty: number, rating: number | null): number {
  if (rating === null || rating === undefined) {
    return 0 // Unrated submissions contribute 0 points
  }

  return difficulty * rating
}

/**
 * Calculate total score and metrics for a team
 */
export function calculateTeamScore(
  submissions: Array<{
    id: string
    task: {
      title: string
      difficulty: number
    }
    rating: number | null
  }>
): TeamScore {
  const submissionScores: SubmissionScore[] = submissions.map(sub => {
    const score = calculateSubmissionScore(sub.task.difficulty, sub.rating)
    return {
      submissionId: sub.id,
      taskTitle: sub.task.title,
      difficulty: sub.task.difficulty,
      rating: sub.rating,
      score,
      isRated: sub.rating !== null && sub.rating !== undefined,
    }
  })

  const ratedSubmissions = submissionScores.filter(s => s.isRated)
  const totalScore = submissionScores.reduce((sum, s) => sum + s.score, 0)

  const averageRating =
    ratedSubmissions.length > 0
      ? ratedSubmissions.reduce((sum, s) => sum + (s.rating || 0), 0) / ratedSubmissions.length
      : 0

  const averageDifficulty =
    submissions.length > 0
      ? submissions.reduce((sum, s) => sum + s.task.difficulty, 0) / submissions.length
      : 0

  return {
    teamId: '', // Will be set by caller
    teamName: '', // Will be set by caller
    submissions: submissionScores,
    totalScore: parseFloat(totalScore.toFixed(1)),
    completedCount: submissions.length,
    ratedCount: ratedSubmissions.length,
    unratedCount: submissions.length - ratedSubmissions.length,
    averageRating: parseFloat(averageRating.toFixed(1)),
    averageDifficulty: parseFloat(averageDifficulty.toFixed(1)),
  }
}

/**
 * Sort teams by their total score (descending)
 * Tiebreaker: number of completed submissions (descending)
 * Secondary tiebreaker: average rating (descending)
 */
export function sortTeamsByScore(teams: TeamScore[]): TeamScore[] {
  return teams.sort((a, b) => {
    if (a.totalScore !== b.totalScore) {
      return b.totalScore - a.totalScore
    }
    if (a.completedCount !== b.completedCount) {
      return b.completedCount - a.completedCount
    }
    return b.averageRating - a.averageRating
  })
}

/**
 * Format score display text for UI
 */
export function formatScoreDisplay(teamScore: TeamScore): {
  totalScore: string
  breakdown: string
  details: string
} {
  const { totalScore, completedCount, ratedCount, unratedCount, averageRating } = teamScore

  let breakdown = `${completedCount} completed`
  if (ratedCount > 0 && averageRating > 0) {
    breakdown += ` × ${averageRating}⭐ avg`
  }

  let details = ''
  if (unratedCount > 0) {
    details = `${unratedCount} awaiting rating`
  }

  return {
    totalScore: totalScore.toString(),
    breakdown,
    details,
  }
}
