import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle } from "lucide-react";

interface ChatPreview {
  id: string;
  last_message: string | null;
  last_message_at: string | null;
  pet: {
    name: string;
    images: string[];
  } | null;
  other_user: {
    name: string;
  } | null;
  unread_count: number;
}

const ChatList = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      setCurrentUserId(session.user.id);

      const { data: chatsData, error } = await supabase
        .from("chats")
        .select(`
          id,
          last_message,
          last_message_at,
          buyer_id,
          seller_id,
          pets:pet_id (name, images)
        `)
        .or(`buyer_id.eq.${session.user.id},seller_id.eq.${session.user.id}`)
        .order("last_message_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Fetch other user details and unread counts
      const enrichedChats = await Promise.all(
        (chatsData || []).map(async (chat) => {
          const otherUserId = chat.buyer_id === session.user.id ? chat.seller_id : chat.buyer_id;
          
          const { data: otherUser } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", otherUserId)
            .single();

          const { count } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("chat_id", chat.id)
            .eq("is_read", false)
            .neq("sender_id", session.user.id);

          return {
            id: chat.id,
            last_message: chat.last_message,
            last_message_at: chat.last_message_at,
            pet: chat.pets as any,
            other_user: otherUser,
            unread_count: count || 0
          };
        })
      );

      setChats(enrichedChats);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-IN", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 animate-pulse">
            <div className="w-14 h-14 bg-muted rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <MessageCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-lg mb-1">No conversations yet</h3>
        <p className="text-muted-foreground text-sm">
          Start chatting with buyers or sellers to see your messages here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => navigate(`/chat/${chat.id}`)}
          className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left"
        >
          <div className="relative">
            {chat.pet?.images?.[0] ? (
              <div className="w-14 h-14 rounded-xl overflow-hidden">
                <img 
                  src={chat.pet.images[0]} 
                  alt={chat.pet.name} 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
            {chat.unread_count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center font-semibold">
                {chat.unread_count > 9 ? "9+" : chat.unread_count}
              </span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <h3 className="font-semibold truncate">{chat.other_user?.name || "User"}</h3>
              {chat.last_message_at && (
                <span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                  {formatTime(chat.last_message_at)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {chat.pet?.name && <span className="font-medium">{chat.pet.name}: </span>}
              {chat.last_message || "Start a conversation"}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
};

export default ChatList;
