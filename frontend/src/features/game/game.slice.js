import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    view: "item_selection", // item_selection | character_selection | negotiation | leaderboard
    gameId: null,
    product: null,
    originalPrice: null,
    selectedBuyer: null,
    selectedSeller: null,
    messages: [],
    status: "idle",     // idle | ongoing | completed | failed
    scoreCard: null,
    loading: false,
    error: null,
    leaderboard: [],
}

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setGameView(state, action) {
            state.view = action.payload;
        },
        selectProduct(state, action) {
            state.product = action.payload.product;
            state.originalPrice = action.payload.originalPrice;
            state.view = "character_selection";
        },
        selectCharacters(state, action) {
            state.selectedBuyer = action.payload.buyer;
            state.selectedSeller = action.payload.seller;
            // Optionally, we transitions to negotiation view after the API call finishes.
        },
        setGameStarted(state, action) {
            const { gameId } = action.payload
            state.gameId = gameId
            state.messages = []
            state.status = "ongoing"
            state.scoreCard = null
            state.error = null
            state.view = "negotiation"
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
    setGameView,
    selectProduct,
    selectCharacters,
    setGameStarted,
    addGameMessage,
    setGameStatus,
    setScoreCard,
    setLeaderboard,
    setGameLoading,
    setGameError,
    resetGame,
} = gameSlice.actions

export default gameSlice.reducer