<script setup>
import { ref } from 'vue';
import api from './stores/api';
console.log('backend url', import.meta.env.VITE_BACKEND_URL);
const liffId = ref('2006490154-oWD68EgW');
const version_number = ref(localStorage.getItem('version_number') || 0);
fetch(
  `https://gist.githubusercontent.com/noracami/e317299b76908c29e59789c83daedb31/raw?t=${Date.now()}`,
  { cache: 'no-cache' },
)
  .then(response => response.text())
  .then(data => {
    const version_number_from_api = parseInt(data);
    console.log('data', version_number_from_api);
    if (version_number_from_api > version_number.value) {
      localStorage.setItem('version_number', version_number_from_api);
      location.reload();
    }
    // version_number.value = data.version;
  });
const header = ref('the header');

// const matchId = ref('')
const matches = ref([]);

const profileId = ref('299982');
const result = ref('');

const errorAtProfileId = ref(false);
const validateRequiredFields = ({ requireProfileId = null }) => {
  if (requireProfileId && !profileId.value) {
    result.value = 'profile id is required';
    errorAtProfileId.value = true;
    return false;
  }

  return true;
};

// https://data.aoe2companion.com/api/matches?profile_ids=8864570&leaderboard_ids=unranked
// .matches | map(select(.matchId == 346524965))[0] | { matchId, teams: [.teams[].teamId], d: .}

const aoe2companionApi = async () => {
  // reset error status
  errorAtProfileId.value = false;

  if (!validateRequiredFields({ requireProfileId: true })) {
    return;
  }

  const url = 'https://data.aoe2companion.com/api/matches';
  const params = new URLSearchParams({
    profile_ids: profileId.value,
    // leaderboard_ids: 'unranked',
  });
  const request = new Request(`${url}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const res = await fetch(request);
  const { matches: matchData } = await res.json();
  const matches = matchData.slice(0, 3);
  for (const match of matches) {
    await api.createMatch({ ...match, timestamp: Date.now() });
  }
  result.value = JSON.stringify(matches, null, 2);

  console.log('aoe2companionApi completed');
  console.log('matches', matches);
};

const functions = ref([
  // {
  //   name: 'aoe2companion',
  //   description: 'description3',
  //   func: aoe2companionApi,
  // },
  // {
  //   name: 'scanCode',
  //   description: 'description2',
  //   func: scanCode,
  // },
]);

const isLiffImport = ref(false);
const isLiffInitialized = ref(false);
const liffData = ref([]);
const errorMessages = ref([]);

const init = () => {
  if (liff) {
    isLiffImport.value = true;
    if (liff.isInClient()) {
      console.warn('isInClient');
    } else {
      console.warn('isInExternalBrowser');
    }
    liffData.value.push(['getOS', liff.getOS()]);
    liffData.value.push(['getAppLanguage', liff.getAppLanguage()]);
    liffData.value.push(['getLanguage', liff.getLanguage()]);
    liffData.value.push(['getVersion', liff.getVersion()]);
    liffData.value.push(['getLineVersion', liff.getLineVersion()]);
    liffData.value.push(['isInClient', liff.isInClient()]);

    console.warn('liff init success');
    isLiffInitialized.value = true;
    let isLoggedIn;
    liff.isLoggedIn().then(r => {
      isLoggedIn = r;
    liffData.value.push(['isLoggedIn', r]);}

    if (isLoggedIn) {
      const profile = await liff.getProfile();
      liffData.value.push(['profile', profile]);

      const userId = profile.userId;
      liffData.value.push(['userId', userId]);
    } else {
      liffData.value.push(['isLoggedIn', 'not logged in']);
      const line_login = () => {
        const redirectUri = 'https://miao-bao.cc';
        liff.login({ redirectUri });
      };
      functions.value.push({
        name: 'line_login',
        description: 'line login',
        func: line_login,
      });
    }

    // // add login to functions
    // functions.value.push({
    //   name: 'login',
    //   description: 'line login',
    //   func: () => {
    //     const redirectUri = 'https://miao-bao.cc';
    //     // liffData.value.push(['redirectUri', 'https://miao-bao.cc']);
    //     if (!liff.isLoggedIn()) {
    //       liff.login({ redirectUri });
    //     } else {
    //       liffData.value.push(['login', 'already logged in']);
    //     }
    //   },
    // });
    // .catch(error => {
    //   console.error('liff init error', error);
    //   errorMessages.value.push(error.message);
    // });

    const scanCodeV2 = async () => {
      let ret;
      await liff
        .scanCodeV2()
        .then(result => {
          liffData.value.push(['scanCodeV2', result]);
          ret = result;
        })
        .catch(error => {
          console.log('error', error);
          errorMessages.value.push(error.message);
          return undefined;
        });
      return ret;
    };

    // add scanCode to functions
    functions.value.push({
      name: 'scanCode',
      description: 'to scan QRcode',
      func: async () => {
        // liffData.value.push(['test', new Date()]);
        const score = await scanCodeV2();
        liffData.value.push(['score', score]);
        if (!score) return;

        const endpoint = 'https://reserve.lig.com.tw/api/v1/play_records';
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            game: 'AG',
            score,
            display_name: 'test',
            line_id: 'test',
          }),
        })
          .then(response => response.json())
          .then(data => {
            liffData.value.push(['api response', data]);
          });
      },
    });
  }
};

import { onMounted } from 'vue';

onMounted(() => {
  console.log('mounted');

  // Using a Promise object
  liff.init(
    {
      liffId: liffId.value, // Use own liffId
      withLoginOnExternalBrowser: true, // Enable automatic login process
    },
    init,
    error => {
      console.error('liff init error', error);
      errorMessages.value.push(error.message);
    },
  );
});
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
          <div v-if="false" class="col-span-3">
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
            class="aspect-square rounded-3xl flex flex-col justify-end items-center bg-green-200 p-3 active:transform active:scale-95"
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
    <section v-if="false" class="bg-sky-300 p-3">
      <div class="container mx-auto text-center">
        <p>content block</p>
        <textarea name="result" class="w-full p-2" v-model="result"></textarea>
      </div>
    </section>
    <section v-if="false" class="text-center">
      <pre>matches columns</pre>
    </section>
    <section v-if="false" class="bg-gray-400">
      <div
        class="container mx-auto grid grid-cols-1 gap-1 p-2 border-dashed border border-black"
        v-if="matches.length > 0"
      >
        <template
          v-for="{
            _id: id,
            matchId,
            name: lobby_name,
            started: match_time,
            mapName: location,
            mapImageUrl,
            teams,
            victory,
          } in matches"
          :key="id"
        >
          <div class="border border-black p-1">
            <p>{{ id }}</p>
            <img :src="mapImageUrl" alt="" />
            <div>
              <pre class="inline">lobby_id: </pre>
              {{ matchId }}
            </div>
            <div>
              <pre class="inline">lobby_name: </pre>
              {{ lobby_name }}
            </div>
            <div>
              <pre class="inline">match_time: </pre>
              {{ match_time }}
            </div>
            <div>
              <pre class="inline">location: </pre>
              {{ location }}
            </div>
            <div>
              <pre class="inline">match_result: </pre>
              {{ `team ${victory} win` }}
            </div>
            <div class="border border-dashed border-gray-600 p-1">
              <pre class="inline">teams: </pre>
              <template v-for="{ players, teamId } in teams" :key="teamId">
                <div class="border border-dashed border-sky-500 p-1">
                  <pre class="inline">team {{ teamId }}</pre>
                  <template
                    v-for="{
                      profileId: user_id,
                      color: color_code,
                      colorHex,
                      name,
                      civImageUrl,
                      civName: civilization,
                      rating,
                      ratingDiff: rating_change,
                      bonus,
                    } in players"
                    :key="user_id"
                  >
                    <div class="h-12 w-fit flex">
                      <div
                        class="bg-from-data p-3 aspect-square flex justify-center items-center"
                        :style="`background-color: ${colorHex}`"
                      >
                        {{ color_code }}
                      </div>
                      <img :src="civImageUrl" alt="" class="h-full w-full" />
                    </div>
                    <div>
                      <pre class="inline">user_id: </pre>
                      {{ user_id }}
                    </div>
                    <div>
                      <pre class="inline">color_code: </pre>
                      {{ color_code }}
                    </div>
                    <div>
                      <pre class="inline">name: </pre>
                      {{ name }}
                    </div>
                    <div>
                      <pre class="inline">civilization: </pre>
                      {{ civilization }}
                    </div>
                    <div>
                      <pre class="inline">rating: </pre>
                      {{ rating }}
                    </div>
                    <div>
                      <pre class="inline">rating_change: </pre>
                      {{ rating_change }}
                    </div>
                    <div>
                      <pre class="inline">bonus: </pre>
                      {{ bonus }}
                    </div>
                  </template>
                </div>
              </template>
            </div>
            <!-- "civ": "malay",
          "civImageUrl": "https://frontend.cdn.aoe2companion.com/public/aoe2/de/civilizations/malay.png",
          "civName": "Malay", -->

            <!-- "players": [
        {
          "rating": "1250",
          "rating_change": "-11",
          "bonus": ""
        }, -->
          </div>
        </template>
      </div>
      <pre class="text-start">{{ JSON.stringify(matches[0], null, 2) }}</pre>
    </section>
    <section v-if="false" class="bg-purple-200 p-3">
      <div class="container mx-auto text-center">
        <p>result block</p>
        <div class="grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div class="col-span-3">
            <p>matches</p>
            <ul>
              <li v-for="match in matches" :key="match.matchId">
                <p>{{ match.matchId }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
    <section class="bg-slate-300 p-3 text-center">
      <div class="">
        <p>liff block</p>
      </div>
      <div class="text-blue-700">
        <p>is Liff Import: {{ isLiffImport }}</p>
        <p>is Liff is initialized: {{ isLiffInitialized }}</p>
      </div>
    </section>
    <section class="bg-green-300 p-3 text-center">
      <p v-for="[key, value] of liffData" :key="key">{{ key }}: {{ value }}</p>
    </section>
    <section class="bg-red-300 p-3 text-center">
      <p v-for="message in errorMessages" :key="message">{{ message }}</p>
    </section>
    <section class="p-3 text-center">
      <p>current version: v{{ version_number }}</p>
      <p>liffId: {{ liffId }}</p>
    </section>
  </main>
</template>

<style scoped>
.bg-from-data {
  background-color: var(--color);
}
</style>
