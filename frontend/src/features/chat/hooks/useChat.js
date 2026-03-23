import { initializeSocketConnection } from "../service/chat.socket.js";
import {
  setChats,
  setCurrentChatId,
  setError,
  setLoading,
  createNewChat,
  addNewMessage,
  getChatMessages
} from "../chat.slice.js";
import {
  sendMessage,
  getChats,
  deleteMessages,
  getMessages,
} from "../service/chat.api.js";
import { useDispatch } from "react-redux";

export const useChat = () => {
  const dispatch = useDispatch();

  const handleSendMessage = async ({ message, chatId }) => {
    try {
      dispatch(setLoading(true));
      const data = await sendMessage({ message, chatId });
      const { chat, aiMessage } = data;

      const finalChatId = chatId || chat._id;  

      if(!chatId){
        dispatch(
            createNewChat({
            chatId: chat._id,
            title: chat.title,
            }),
        );
      }

      dispatch(
        addNewMessage({
          chatId: chatId || chat._id,
          content: message,
          role: "user",
        }),
      );

      dispatch(
        addNewMessage({
          chatId: chatId || chat._id,
          content: aiMessage.content,
          role: aiMessage.role,
        }),
      );

      dispatch(setCurrentChatId(finalChatId));

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

  return {
    initializeSocketConnection,
    handleSendMessage,
    handleGetChats,
    handleGetMessages
  };
};
