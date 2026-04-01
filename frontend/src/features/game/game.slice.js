import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    gameId: null,
    product: null,
    originalPrice: null,
    messages: [],       
    status: "idle",     // "idle" | "ongoing" | "completed" | "failed"
    scoreCard: null,
    loading: false,
    error: null,
}

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameStarted(state, action) {
            const { gameId, product, originalPrice } = action.payload
            state.gameId = gameId
            state.product = product
            state.originalPrice = originalPrice
            state.messages = []
            state.status = "ongoing"
            state.scoreCard = null
            state.error = null
        },
        addGameMessage(state, action) {
            // { role, content }
            state.messages.push(action.payload)
        },
        setGameStatus(state, action) {
            state.status = action.payload
        },
        setScoreCard(state, action) {
            state.scoreCard = action.payload
        },
        setGameLoading(state, action) {
            state.loading = action.payload
        },
        setGameError(state, action) {
            state.error = action.payload
        },
        resetGame(state) {
            return initialState
        }
    }
})

export const {
    setGameStarted,
    addGameMessage,
    setGameStatus,
    setScoreCard,
    setGameLoading,
    setGameError,
    resetGame,
} = gameSlice.actions

export default gameSlice.reducer