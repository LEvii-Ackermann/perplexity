import axios from "axios"
import { API_BASE_URL } from "../../../app/api.config.js"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function startGame({ product, originalPrice }) {
    const response = await api.post("/api/game/start", { product, originalPrice })
    return response.data
}

export async function sendGameMessage({ gameId, message, offer }) {
    const response = await api.post("/api/game/message", { gameId, message, offer })
    return response.data
}

export async function fetchLeaderboard() {
    const response = await api.get("/api/game/leaderboard")
    return response.data
}

export async function fetchLatestScore() {
    const response = await api.get("/api/game/score")
    return response.data
}

export async function fetchUserRank() {
    const response = await api.get("/api/game/userRank")
    return response.data
}