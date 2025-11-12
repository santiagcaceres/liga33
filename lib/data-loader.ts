import { getTeamsByTournament } from "./actions/teams"
import { getPlayersByTournament } from "./actions/players"
import { getMatchesByTournament } from "./actions/matches"
import { getGroupsByTournament } from "./actions/groups"
import { getByeWeeks } from "./actions/bye-weeks"
import { getStandingsByTournament } from "./actions/standings"

export async function loadLibertadoresData() {
  console.log("[v0] 🚀 Starting parallel data load for Libertadores...")
  const startTime = Date.now()

  try {
    const [teams, players, matches, groups] = await Promise.all([
      getTeamsByTournament(1),
      getPlayersByTournament(1),
      getMatchesByTournament(1),
      getGroupsByTournament(1),
    ])

    const endTime = Date.now()
    console.log(`[v0] ✅ Libertadores data loaded in ${endTime - startTime}ms`)

    return { teams, players, matches, groups }
  } catch (error) {
    console.error("[v0] ❌ Error loading Libertadores data:", error)
    throw error
  }
}

export async function loadFemeninaData() {
  console.log("[v0] 🚀 Starting parallel data load for Femenina...")
  const startTime = Date.now()

  try {
    const [teams, players, matches, standings, byeWeeks] = await Promise.all([
      getTeamsByTournament(2),
      getPlayersByTournament(2),
      getMatchesByTournament(2),
      getStandingsByTournament(2),
      getByeWeeks(2),
    ])

    const endTime = Date.now()
    console.log(`[v0] ✅ Femenina data loaded in ${endTime - startTime}ms`)

    return { teams, players, matches, standings, byeWeeks }
  } catch (error) {
    console.error("[v0] ❌ Error loading Femenina data:", error)
    throw error
  }
}
