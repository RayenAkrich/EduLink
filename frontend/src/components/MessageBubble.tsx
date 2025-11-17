export default function MessageBubble({ message, isMe }: any) {
  return (
    <div className={`w-full flex ${isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-xl text-white 
        ${isMe ? "bg-blue-600" : "bg-gray-700"}`}
      >
        {message.contenu}
        <div className="text-xs opacity-70 mt-1">
          {new Date(message.date_envoi).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
