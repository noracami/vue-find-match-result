// // https://api.ageofempires.com/api/v2/AgeII/GetMPMatchDetail
// // {
// //     "gameId": "343670400",
// //     "game": "age2",
// //     "profileId": "473590"
// // }
// const officialApi = async () => {
//   // reset error status
//   errorAtMatchId.value = errorAtProfileId.value = false
//   if (matchId.value) {
//     const prefetchedMatch = await api.getMatch(matchId.value)
//     if (prefetchedMatch) {
//       result.value = JSON.stringify(prefetchedMatch, null, 2)
//       return
//     }
//   }

//   if (
//     !validateRequiredFields({ requireMatchId: true, requireProfileId: true })
//   ) {
//     return
//   }

//   const url = 'https://api.ageofempires.com/api/v2/AgeII/GetMPMatchDetail'
//   const res = await fetch(url, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       gameId: matchId.value,
//       game: 'age2',
//       profileId: profileId.value,
//     }),
//   })
//   const data = await res.json()
//   result.value = JSON.stringify(data, null, 2)
//   api.createMatch({ ...data, timestamp: Date.now() })
// }

// const insightApi = () => {
//   // reset error status
//   errorAtMatchId.value = errorAtProfileId.value = false
//   if (!validateRequiredFields({ requireMatchId: true })) {
//     return
//   }
//   result.value = 'insight (coming soon)'
// }
