import React, { useState, useEffect, useRef } from "react";
import { Send, MessageCircle, Search, User } from "lucide-react";
import { useUser } from "../pages/Shared/userContext";
import { socketService } from "../services/socketService";
import toast from "react-hot-toast";

interface Message {
  id_message: number;
  expediteur_id: number;
  destinataire_id: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
  expediteur: { id_user: number; nom: string; role: string };
  destinataire: { id_user: number; nom: string; role: string };
}

interface Conversation {
  partner: { id_user: number; nom: string; email: string; role: string };
  lastMessage: Message;
  unreadCount: number;
}

interface UserOption {
  id_user: number;
  nom: string;
  email: string;
  role: string;
}

const Messaging: React.FC = () => {
  const { user } = useUser();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [users, setUsers] = useState<UserOption[]>([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchUsers();

      // Listen for new messages
      const handleNewMessage = (message: Message) => {
        // Update conversations
        fetchConversations();
        
        // If this message is from the currently selected conversation, add it
        if (selectedConversation && 
            (message.expediteur_id === selectedConversation || message.destinataire_id === selectedConversation)) {
          setMessages(prev => [...prev, message]);
          scrollToBottom();
        }
        
        toast.success(`Nouveau message de ${message.expediteur.nom}`);
      };

      socketService.on("new_message", handleNewMessage);

      return () => {
        socketService.off("new_message", handleNewMessage);
      };
    }
  }, [user, selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages/conversations", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      setLoadingMessages(true);
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/messages/conversation/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          destinataire_id: selectedConversation,
          contenu: newMessage
        })
      });

      const data = await response.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data]);
        setNewMessage("");
        fetchConversations();
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const startNewConversation = (userId: number) => {
    setSelectedConversation(userId);
    setShowNewChat(false);
    setSearchTerm("");
  };

  const filteredUsers = users.filter(u =>
    u.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredConversations = conversations.filter(c =>
    c.partner.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedPartner = selectedConversation
    ? conversations.find(c => c.partner.id_user === selectedConversation)?.partner ||
      users.find(u => u.id_user === selectedConversation)
    : null;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Hier";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("fr-FR", { weekday: "short" });
    } else {
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex bg-slate-50">
      {/* Sidebar - Conversations List */}
      <div className="w-80 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-xl font-bold mb-3">Messagerie</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowNewChat(!showNewChat)}
            className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={18} />
            Nouveau message
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {showNewChat ? (
            <div className="p-2">
              <h3 className="text-sm font-semibold text-slate-600 px-2 mb-2">
                Sélectionner un utilisateur
              </h3>
              {filteredUsers.map((u) => (
                <div
                  key={u.id_user}
                  onClick={() => startNewConversation(u.id_user)}
                  className="flex items-center gap-3 p-3 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                    <User size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{u.nom}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {u.role}
                  </span>
                </div>
              ))}
            </div>
          ) : loadingConversations ? (
            // Skeleton loader for conversations
            <div className="p-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 border-b border-slate-100 animate-pulse"
                >
                  <div className="w-12 h-12 bg-slate-300 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-2">
                      <div className="h-4 bg-slate-300 rounded w-32"></div>
                      <div className="h-3 bg-slate-300 rounded w-12"></div>
                    </div>
                    <div className="h-3 bg-slate-300 rounded w-48"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <MessageCircle size={48} className="mx-auto mb-2 opacity-30" />
                  <p>Aucune conversation</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.partner.id_user}
                    onClick={() => setSelectedConversation(conv.partner.id_user)}
                    className={`flex items-center gap-3 p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${
                      selectedConversation === conv.partner.id_user ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="w-12 h-12 bg-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                      <User size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold text-sm truncate">{conv.partner.nom}</p>
                        <span className="text-xs text-slate-400">
                          {formatTime(conv.lastMessage.date_envoi)}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 truncate">
                        {conv.lastMessage.contenu}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation && selectedPartner ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-300 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-semibold">{selectedPartner.nom}</p>
                <p className="text-sm text-slate-500">{selectedPartner.role}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingMessages ? (
                // Skeleton loader
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md px-4 py-3 rounded-2xl ${
                          i % 2 === 0 ? "bg-blue-100" : "bg-slate-100"
                        } animate-pulse`}
                      >
                        <div className="h-4 bg-slate-300 rounded w-48 mb-2"></div>
                        <div className="h-3 bg-slate-300 rounded w-16"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isOwn = msg.expediteur_id === user?.id_user;
                    return (
                      <div
                        key={msg.id_message}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md px-4 py-2 rounded-2xl ${
                            isOwn
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-slate-200"
                          }`}
                        >
                          <p className="text-sm">{msg.contenu}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? "text-blue-100" : "text-slate-400"
                            }`}
                          >
                            {formatTime(msg.date_envoi)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Écrire un message..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg">Sélectionnez une conversation pour commencer</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messaging;