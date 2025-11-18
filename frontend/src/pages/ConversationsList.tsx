import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getConversationsList } from "../api/messagesApi";
import ConversationItem from "../components/ConversationItem";
import { getSocket } from "../socket/socket";

export default function ConversationsList({ onSelect }: any) {
  const { token } = useUser();
  const [conversations, setConversations] = useState([]);

  const load = () => {
    getConversationsList(token).then((res) => {
      setConversations(res.data);
    }).catch((err) => {
      console.error("Error loading conversations:", err);
    });
  };

  useEffect(() => {
    load();

    const socket = getSocket();
    socket.on("message:new", () => {
      load();
    });

    return () => {
      socket.off("message:new");
    };
  }, []);

  return (
    <div className="w-80 h-full border-r border-gray-700 bg-gray-900 overflow-y-auto">
      {conversations.map((conv: any) => (
        <ConversationItem
          key={conv.id_user}
          conv={conv}
          onClick={() => onSelect(conv.id_user)}
        />
      ))}
    </div>
  );
}
