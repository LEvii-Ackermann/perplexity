import {createSlice} from "@reduxjs/toolkit"

    const chatSlice = createSlice({
        name: "chat",
        initialState: {
            chats: {},
            currentChatId: null,
            error: null,
            loading: false,
        },
        reducers: {
            createNewChat: (state, action) => {
                const {chatId, title} = action.payload
                state.chats[chatId] = {
                    id: chatId,
                    title,
                    messages: [],
                    createdAt: new Date().toISOString()
                }
            },
            addNewMessage: (state, action) => {
                const {chatId, content, role} = action.payload
                state.chats[chatId].messages.push({
                    content,
                    role
                })
            },
            getChatMessages: (state, action) => {
                const {chatId, messages} = action.payload
                state.chats[chatId].messages = messages;
            },
            setChats: (state, action) => {
                state.chats = action.payload
            },
            setCurrentChatId: (state, action) => {
                state.currentChatId = action.payload
            },
            setError: (state, action) => {
                state.error = action.payload
            },
            setLoading: (state, action) => {
                state.loading = action.payload
            }
    }
})

export const {setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, getChatMessages} = chatSlice.actions
export default chatSlice.reducer



//How chat is going to be stored 
// chat = {
//     "what is triangle": [
//         {
//             content,              //message1
//             role
//         },
//         {
//             content,              //message2
//             role
//         }
//     ]
// }