"use client";
import ChatPage from "~/components/chat/ChatPage";
import { Protected } from "~/components/guards";

export default function ChatRoute() {
  return (
    <Protected role="user">
      <ChatPage />
    </Protected>
  );
}
