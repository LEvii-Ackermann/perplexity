import { useDispatch, useSelector } from "react-redux"
import { startGame, sendGameMessage } from "../service/game.api.js"
import {
    setGameStarted,
    addGameMessage,
    setGameStatus,
    setScoreCard,
    setGameLoading,
    setGameError,
    resetGame,
} from "../game.slice.js"

export const useGame = () => {
    const dispatch = useDispatch()
    const gameState = useSelector((state) => state.game)

    const handleStartGame = async ({ product, originalPrice }) => {
        try {
            dispatch(setGameLoading(true))
            const data = await startGame({ product, originalPrice })

            dispatch(setGameStarted({
                gameId: data.gameId,
                product,
                originalPrice,
            }))

            // First AI message — shopkeeper opens the negotiation
            dispatch(addGameMessage({
                role: "ai",
                content: `Haan bolo, ${product} chahiye? Price hai ₹${originalPrice}. Kya offer karoge? 😏`
            }))
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleSendMessage = async (message) => {
        if (!gameState.gameId) return

        try {
            dispatch(setGameLoading(true))

            // Optimistically add user message
            dispatch(addGameMessage({ role: "user", content: message }))

            const data = await sendGameMessage({
                gameId: gameState.gameId,
                message,
            })

            // Add AI reply
            dispatch(addGameMessage({ role: "ai", content: data.reply }))

            // Update game status
            dispatch(setGameStatus(data.status))

            if (data.status === "completed" && data.scoreCard) {
                dispatch(setScoreCard(data.scoreCard))
            }
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleResetGame = () => {
        dispatch(resetGame())
    }

    return {
        ...gameState,
        handleStartGame,
        handleSendMessage,
        handleResetGame,
    }
}