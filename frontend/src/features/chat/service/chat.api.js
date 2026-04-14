import axios from "axios"
import { API_BASE_URL } from "../../../app/api.config.js"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})

export async function sendMessage({message, chatId}) {
    const response = await api.post("/api/chats/message", {
        message, chatId
    })
    return response.data
}

export async function getChats() {
    const response = await api.get("/api/chats/")
    return response.data
}

export async function getMessages(chatId) {
    const response = await api.get(`/api/chats/${chatId}/messages`)
    return response.data
}

export async function deleteChat(chatId) {
    const response = await api.get(`/api/chats/${chatId}/delete`)
    return response.data
}

