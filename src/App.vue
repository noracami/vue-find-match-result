<script setup>
import { ref } from 'vue'
import api from './stores/api'
const header = ref('the header')

const matchId = ref('')
const profileId = ref('299982')
const result = ref('')

const errorAtMatchId = ref(false)
const errorAtProfileId = ref(false)
const validateRequiredFields = ({
  requireMatchId = null,
  requireProfileId = null,
}) => {
  if (requireMatchId && !matchId.value) {
    result.value = 'match id is required'
    errorAtMatchId.value = true
    return false
  }

  if (requireProfileId && !profileId.value) {
    result.value = 'profile id is required'
    errorAtProfileId.value = true
    return false
  }

  return true
}

// https://api.ageofempires.com/api/v2/AgeII/GetMPMatchDetail
// {
//     "gameId": "343670400",
//     "game": "age2",
//     "profileId": "473590"
// }
const officialApi = async () => {
  // reset error status
  errorAtMatchId.value = errorAtProfileId.value = false
  if (matchId.value) {
    const prefetchedMatch = await api.getMatch(matchId.value)
    if (prefetchedMatch) {
      result.value = JSON.stringify(prefetchedMatch, null, 2)
      return
    }
  }

  if (
    !validateRequiredFields({ requireMatchId: true, requireProfileId: true })
  ) {
    return
  }

  const url = 'https://api.ageofempires.com/api/v2/AgeII/GetMPMatchDetail'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gameId: matchId.value,
      game: 'age2',
      profileId: profileId.value,
    }),
  })
  const data = await res.json()
  result.value = JSON.stringify(data, null, 2)
  api.createMatch({ ...data, timestamp: Date.now() })
}
const insightApi = () => {
  // reset error status
  errorAtMatchId.value = errorAtProfileId.value = false
  if (!validateRequiredFields({ requireMatchId: true })) {
    return
  }
  result.value = 'insight (coming soon)'
}

// https://data.aoe2companion.com/api/matches?profile_ids=8864570&leaderboard_ids=unranked
// .matches | map(select(.matchId == 346524965))[0] | { matchId, teams: [.teams[].teamId], d: .}

const aoe2companionApi = async () => {
  // reset error status
  errorAtMatchId.value = errorAtProfileId.value = false
  if (matchId.value) {
    const prefetchedMatch = await api.getMatch(matchId.value)
    if (prefetchedMatch) {
      result.value = JSON.stringify(prefetchedMatch, null, 2)
      return
    }
  }

  if (!validateRequiredFields({ requireProfileId: true })) {
    return
  }

  const url = 'https://data.aoe2companion.com/api/matches'
  const params = new URLSearchParams({
    profile_ids: profileId.value,
    // leaderboard_ids: 'unranked',
  })
  const request = new Request(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const res = await fetch(request)
  const { matches } = await res.json()
  result.value = JSON.stringify(matches.at(0), null, 2)
  matchId.value = matches.at(0).matchId

  const record = await api.getMatch(matchId.value)
  if (record) {
    console.log('match already exists')
    return
  }
  api.createMatch({ ...matches.at(0), timestamp: Date.now() })
}

const functions = ref([
  { name: '官方 API', description: 'description1', func: officialApi },
  { name: 'insight', description: 'description2', func: insightApi },
  {
    name: 'aoe2companion',
    description: 'description3',
    func: aoe2companionApi,
  },
])
</script>

<template>
  <main class="bg-gray-500 h-lvh">
    <header class="bg-red-200 p-3">
      <div
        class="container mx-auto text-center border-dashed border border-black"
      >
        <p>{{ header }}</p>
      </div>
    </header>

    <section class="bg-yellow-200 p-3">
      <div class="container mx-auto text-center">
        <p>command block</p>
        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div class="col-span-3">
            <label class="text-start">
              <p class="ps-1">match_id、room_id、game_id</p>
              <input
                type="text"
                class="w-full p-1"
                v-model="matchId"
                placeholder="game id"
              />
            </label>
          </div>
          <div class="col-span-3">
            <label class="text-start">
              <p class="ps-1">profile_id</p>
              <input
                type="text"
                class="w-full p-1"
                v-model="profileId"
                placeholder="profile id"
              />
            </label>
          </div>
          <button
            type="button"
            class="aspect-square flex flex-col justify-end items-center bg-green-200 p-3 active:transform active:scale-95"
            v-for="{ name, description, func } of functions"
            :key="name"
            @click="func"
          >
            <div class="grow flex flex-col justify-center">
              <p>{{ name }}</p>
            </div>
            <p>{{ description }}</p>
          </button>
        </div>
      </div>
    </section>
    <section class="bg-sky-300 p-3">
      <div class="container mx-auto text-center">
        <p>content block</p>
        <textarea name="result" class="w-full p-2" v-model="result"></textarea>
      </div>
    </section>
  </main>
</template>

<style scoped></style>
