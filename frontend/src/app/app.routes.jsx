import { createBrowserRouter, Navigate } from 'react-router'
import Login from '../features/auth/pages/Login.jsx'
import Register from '../features/auth/pages/Register.jsx'
import Dashboard from '../features/chat/pages/Dashboard.jsx'
import Protected from '../features/auth/components/Protected.jsx'
import Game from '../features/game/pages/Game.jsx'
import ItemSelection from '../features/game/components/ItemSelection.jsx'
import CharacterSelection from '../features/game/components/CharacterSelection.jsx'
import NegotiationBoard from '../features/game/components/NegotiationBoard.jsx'
import ScoreBoard from '../features/game/components/ScoreBoard.jsx'
import Leaderboard from '../features/game/components/Leaderboard.jsx'

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Protected>
            <Dashboard />
        </Protected>
    },
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/game',
        element: <Protected>
            <Game />
        </Protected>,
        children: [
            {
                index: true,
                element: <Navigate to="item-selection" replace />
            },
            {
                path: 'item-selection',
                element: <ItemSelection />
            },
            {
                path: 'character-selection',
                element: <CharacterSelection />
            },
            {
                path: 'negotiation',
                element: <NegotiationBoard />
            },
            {
                path: 'scoreboard',
                element: <ScoreBoard />
            },
            {
                path: 'leaderboard',
                element: <Leaderboard />
            }
        ]
    }
])