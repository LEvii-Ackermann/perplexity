import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    gameId: null,
    product: null,
    originalPrice: null,
    selectedBuyer: null,
    selectedSeller: null,
    messages: [],
    status: "idle",     // idle | ongoing | completed | failed
    scoreCard: null,
    latestScore: null,
    userRank: null,
    loading: false,
    error: null,
    leaderboard: [],
}

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        selectProduct(state, action) {
            state.product = action.payload.product;
            state.originalPrice = action.payload.originalPrice;
        },
        selectCharacters(state, action) {
            state.selectedBuyer = action.payload.buyer;
            state.selectedSeller = action.payload.seller;
        },
        setGameStarted(state, action) {
            const { gameId } = action.payload
            state.gameId = gameId
            state.messages = []
            state.status = "ongoing"
            state.scoreCard = null
            state.error = null
        },
        addGameMessage(state, action) {
            state.messages.push(action.payload)
        },
        setGameStatus(state, action) {
            state.status = action.payload
        },
        setScoreCard(state, action) {
            state.scoreCard = action.payload
        },
        setLatestScore(state, action) {
            state.latestScore = action.payload
        },
        setUserRank(state, action) {
            state.userRank = action.payload
        },
        setLeaderboard(state, action) {
            state.leaderboard = action.payload
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
    selectProduct,
    selectCharacters,
    setGameStarted,
    addGameMessage,
    setGameStatus,
    setScoreCard,
    setLatestScore,
    setUserRank,
    setLeaderboard,
    setGameLoading,
    setGameError,
    resetGame,
} = gameSlice.actions

export default gameSlice.reducer