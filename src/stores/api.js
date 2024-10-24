class flaskApi {
  constructor() {
    this.backendUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1`

    // this.backendUrl = 'https://backend-aoe-29-matches.hkg1.zeabur.app/api/v1'
  }

  async getMatch(matchId) {
    const response = await fetch(`${this.backendUrl}/matches/${matchId}`)
    return response.json()
  }

  async getMatches() {
    const response = await fetch(`${this.backendUrl}/matches`)
    return response.json()
  }

  async createMatch(match) {
    const response = await fetch(`${this.backendUrl}/matches`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(match),
    })
    return response.json()
  }

  async updateMatch(matchId, match) {
    const response = await fetch(`${this.backendUrl}/matches/${matchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(match),
    })
    return response.json()
  }
}

const api = new flaskApi()

export default api
