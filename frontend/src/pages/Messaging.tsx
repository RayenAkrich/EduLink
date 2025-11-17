import { useState } from "react";
import ConversationsList from "./ConversationsList";
import ChatPage from "./ChatPage";

export default function Messaging() {
  const [selectedUser, setSelectedUser] = useState<number | null>(null);

  return (
    <div className="flex h-screen text-white">
      <ConversationsList onSelect={setSelectedUser} />

      {selectedUser ? (
        <ChatPage userId={selectedUser} />
      ) : (
        <div className="flex flex-1 items-center justify-center bg-gray-800">
          <p>Select a conversation</p>
        </div>
      )}
    </div>
  );
}
