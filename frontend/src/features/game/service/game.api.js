import axios from "axios"

const api = axios.create({
    baseURL: "http://localhost:3000",
    withCredentials: true
})

export async function startGame({ product, originalPrice }) {
    const response = await api.post("/api/game/start", { product, originalPrice })
    return response.data
}

export async function sendGameMessage({ gameId, message }) {
    const response = await api.post("/api/game/message", { gameId, message })
    return response.data
}