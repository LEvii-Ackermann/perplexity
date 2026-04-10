import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router"
import {
    startGame,
    sendGameMessage,
    fetchLeaderboard,
    fetchLatestScore,
    fetchUserRank,
} from "../service/game.api.js"
import {
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
} from "../game.slice.js"

export const useGame = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const gameState = useSelector((state) => state.game)

    const handleSelectProduct = (product, originalPrice) => {
        dispatch(selectProduct({ product, originalPrice }))
        navigate("/game/character-selection")
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

            navigate("/game/negotiation")
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
                navigate("/game/scoreboard")
            } else if (data.status === "failed") {
                navigate("/game/scoreboard")
            }
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleFetchLeaderboard = async ({ navigateToLeaderboard = true } = {}) => {
        try {
            dispatch(setGameLoading(true))
            const data = await fetchLeaderboard()
            dispatch(setLeaderboard(data.leaderboard))
            if (navigateToLeaderboard) {
                navigate("/game/leaderboard")
            }
        } catch (error) {
            dispatch(setGameError(error.message))
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleFetchLatestScore = async () => {
        try {
            dispatch(setGameLoading(true))
            const data = await fetchLatestScore()
            dispatch(setLatestScore(data))
            return data
        } catch (error) {
            if (error?.response?.status !== 404) {
                dispatch(setGameError(error.message))
            }
            return null
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleFetchUserRank = async () => {
        try {
            dispatch(setGameLoading(true))
            const data = await fetchUserRank()
            dispatch(setUserRank(data))
            return data
        } catch (error) {
            dispatch(setGameError(error.message))
            return null
        } finally {
            dispatch(setGameLoading(false))
        }
    }

    const handleResetGame = () => {
        dispatch(resetGame())
        navigate("/game/item-selection")
    }

    return {
        ...gameState,
        handleSelectProduct,
        handleSelectCharacters,
        handleStartGame,
        handleSendMessage,
        handleFetchLeaderboard,
        handleFetchLatestScore,
        handleFetchUserRank,
        handleResetGame,
    }
}