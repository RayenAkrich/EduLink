import { useEffect, useState, useRef } from "react";
import { useUser } from "../context/UserContext";
import { getConversation, sendMessage, markAsRead } from "../api/messagesApi";
import MessageBubble from "../components/MessageBubble";
import { getSocket } from "../socket/socket";

export default function ChatPage({ userId }: any) {
  const { user, token } = useUser();
  const [messages, setMessages] = useState([]);
  const [contenu, setContenu] = useState("");

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadConversation = () => {
    getConversation(token, userId).then((res) => {
      setMessages(res.data);
      markAsRead(token, userId);
    }).catch((err) => {
      console.error("Error loading conversation:", err);
    });
  };

  useEffect(() => {
    loadConversation();

    const socket = getSocket();
    socket.on("message:new", (msg) => {
      if (msg.expediteur_id === userId || msg.destinataire_id === userId) {
        loadConversation();
      }
    });

    return () => {
      socket.off("message:new");
    };
  }, [userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!contenu.trim()) return;

    await sendMessage(token, userId, contenu);
    setContenu("");
  };

  return (
    <div className="flex-1 bg-gray-800 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m: any) => (
          <MessageBubble key={m.id_message} message={m} isMe={m.expediteur_id === user?.id_user} />
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="p-4 bg-gray-900 flex gap-2">
        <input
          className="flex-1 bg-gray-700 p-2 rounded"
          placeholder="Write a message..."
          value={contenu}
          onChange={(e) => setContenu(e.target.value)}
        />
        <button
          onClick={handleSend}
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
