export default function ConversationItem({ conv, onClick, selected }: any) {
  return (
    <div
      className={`p-4 cursor-pointer border-b border-gray-700 
      ${selected ? "bg-gray-800" : "hover:bg-gray-900"}`}
      onClick={onClick}
    >
      <div className="flex justify-between">
        <h3 className="font-semibold">{conv.nom}</h3>
        {conv.unread > 0 && (
          <span className="text-xs bg-blue-600 rounded-full px-2 py-1">
            {conv.unread}
          </span>
        )}
      </div>

      <p className="text-gray-400 text-sm truncate mt-1">
        {conv.last_message || "No messages"}
      </p>
    </div>
  );
}
