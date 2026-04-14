import axios from "axios"
import { API_BASE_URL } from "../../../app/api.config.js"

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true
})


export async function register ({email, username, password}) {
    const response = await api.post("/api/auth/register", {
        email, username, password
    })
    return response.data
}

export async function login ({email, password}) {
    const response = await api.post("/api/auth/login", {
        email, password
    })
    return response.data
}

export function googleAuth() {
    window.location.href = `${API_BASE_URL}/api/auth/google`
}

export async function getMe (){
    const response = await api.get("/api/auth/get-me")
    return response.data
}

export async function logout () {
    const response = await api.get("/api/auth/logout")
    return response.data
}
