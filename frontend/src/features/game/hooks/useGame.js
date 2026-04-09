import { useDispatch, useSelector } from "react-redux"
import { startGame, sendGameMessage, fetchLeaderboard } from "../service/game.api.js"
import {
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
} from "../game.slice.js"

export const useGame = () => {
    const dispatch = useDispatch()
    const gameState = useSelector((state) => state.game)

    const handleSelectProduct = (product, originalPrice) => {
        dispatch(selectProduct({ product, originalPrice }))
    }

    const handleSelectCharacters = (buyer, seller) => {
        dispatch(selectCharacters({ buyer, seller }))
    }

    const handleStartGame = async () => {
        try {
            dispatch(setGameLoading(true))
            const data = await startGame({ 
                product: gameState.product, 
                originalPrice: gameState.originalPrice 
            })

            dispatch(setGameStarted({
                gameId: data.gameId
            }))

            // First AI message
            dispatch(addGameMessage({
                role: "ai",
                content: `Haan bolo, ${gameState.product} chahiye? Price hai ₹${gameState.originalPrice}. Kya offer karoge? 😏`
            }))
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleSendMessage = async ({message, offer}) => {
        if (!gameState.gameId) return

        try {
            dispatch(setGameLoading(true))

            // Add user message
            dispatch(addGameMessage({
                role: "user",
                content: {
                    message,
                    offer
                }
            }))

            const data = await sendGameMessage({
                gameId: gameState.gameId,
                message,
                offer
            })

            // Add AI reply
            if (data.reply) {
                dispatch(addGameMessage({ role: "ai", content: data.reply }))
            }

            dispatch(setGameStatus(data.status))

            if (data.status === "completed" && data.scoreCard) {
                dispatch(setScoreCard(data.scoreCard))
                dispatch(setGameView("result"))
            } else if (data.status === "failed") {
                dispatch(setGameView("result"))
            }
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleFetchLeaderboard = async () => {
        try {
            dispatch(setGameLoading(true))
            const data = await fetchLeaderboard()
            dispatch(setLeaderboard(data.leaderboard))
            dispatch(setGameView("leaderboard"))
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleMainGameView = () => {
        dispatch(setGameView("negotiation"))
    }

    const handleResetGame = () => {
        dispatch(resetGame())
    }

    return {
        ...gameState,
        handleSelectProduct,
        handleSelectCharacters,
        handleStartGame,
        handleSendMessage,
        handleFetchLeaderboard,
        handleMainGameView,
        handleResetGame,
    }
}