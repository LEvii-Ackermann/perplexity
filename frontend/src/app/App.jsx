import React from 'react'
import { RouterProvider } from 'react-router'
import { router } from './app.routes.jsx'
import { useAuth } from '../features/auth/hooks/useAuth.js'
import { useEffect } from 'react'
import ScoreBoard from '../features/game/components/ScoreBoard.jsx'
 
const App = () => {

  const { handleGetMe } = useAuth()

  useEffect(() => {
    handleGetMe()
  }, [])

  return (
   <RouterProvider router={router} />
  )
}

export default App