"use client";
import ChatPage from "~/components/chat/ChatPage";
import { Protected } from "~/components/guards";

export default function ChatConvRoute() {
  return (
    <Protected role="user">
      <ChatPage />
    </Protected>
  );
}
