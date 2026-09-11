"use client";
// src/context/ChatContext.jsx
import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);

export function ChatProvider({ children }) {
  const [chats] = useState([]);
  return (
    <ChatContext.Provider value={{ chats }}>
      {children}
    </ChatContext.Provider>
  );
}
