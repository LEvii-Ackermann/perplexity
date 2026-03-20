import React from 'react'
import { useSelector } from 'react-redux'
import { useChat } from '../hooks/useChat.js'
import { useEffect } from 'react'

const Dashboard = () => {

  const chat = useChat()
  const user = useSelector((state) => {
    return state.auth?.user
  })

  useEffect(() => {
    chat.initializeSocketConnection()
  }, [])
  
  console.log("User: ", user)

  return (
    <div>Dashboard</div>
  )
}

export default Dashboard