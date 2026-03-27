import { initializeSocketConnection } from "../service/chat.socket.js";
import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  addNewMessage,
  getChatMessages,
  deleteChatReducer,
  replaceTempChat
} from "../chat.slice.js";
import {
  sendMessage,
  getChats,
  deleteChat,
  getMessages,
} from "../service/chat.api.js";
import { useDispatch, useSelector } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();
  const chats = useSelector((state) => state.chat.chats);

  const handleSendMessage = async ({ message, chatId }) => {
    try {
      dispatch(setLoading(true));

      let finalChatId = chatId;
      if (!chatId) {
        const tempChatId = 'temp-' + Date.now();
        dispatch(
          createNewChat({
            chatId: tempChatId,
            title: 'New Chat',
          }),
        );
        dispatch(setCurrentChatId(tempChatId));
        finalChatId = tempChatId;
      }

      dispatch(
        addNewMessage({
          chatId: finalChatId,
          content: message,
          role: "user",
        }),
      );

      const data = await sendMessage({ message, chatId });
      const { chat, aiMessage } = data;

      const realChatId = chat._id;
      if (!chatId) {
        dispatch(replaceTempChat({
          tempChatId: finalChatId,
          realChatId,
          title: chat.title
        }));
        dispatch(setCurrentChatId(realChatId));
        finalChatId = realChatId;
      }

      dispatch(
        addNewMessage({
          chatId: finalChatId,
          content: aiMessage.content,
          role: aiMessage.role,
        }),
      );

      return finalChatId;
    } catch (error) {
      console.log(error);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetChats = async () => {
    try {
      dispatch(setLoading(true));
      const data = await getChats();

      const { chats } = data;
      dispatch(
        setChats(
          chats.reduce((acc, chat) => {
            acc[chat._id] = {
              id: chat._id,
              title: chat.title,
              messages: [],
              createdAt: chat.createdAt,
            };
            return acc;
          }, {}),
        ),
      );
    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleGetMessages = async (chatId) => {
    try {
      dispatch(setLoading(true));

      dispatch(setCurrentChatId(chatId));  

      const data = await getMessages(chatId);  
      const { messages} = data  
      
      const formattedMessages = messages.map((msg) => ({
        content: msg.content,
        role: msg.role
      }))

      dispatch(getChatMessages({
        chatId,
        messages: formattedMessages
      }))

    } catch (error) {
      dispatch(setError(error.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

const handleDeleteChat = async (chatId) => {

  try {
    dispatch(setLoading(true))

    await deleteChat(chatId)

    dispatch(deleteChatReducer(chatId)) 
  }
  catch (error) {
    dispatch(setError(error.message))
  }
  finally {
    dispatch(setLoading(false))
  }
}

  const handleNewChat = () => {
    dispatch(setCurrentChatId(null));
  };

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleGetMessages,
    handleDeleteChat,
    handleNewChat
  };
};
