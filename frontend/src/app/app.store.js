import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/auth.slice.js"
import chatReducer from "../features/chat/chat.slice.js"
import gameReducer from "../features/game/game.slice.js"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        game: gameReducer,
    }
})