import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Send, Phone, MoreVertical, Check, CheckCheck, Image } from "lucide-react";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  is_read: boolean;
}

interface ChatInfo {
  id: string;
  pet_id: string;
  buyer_id: string;
  seller_id: string;
  pet?: {
    name: string;
    images: string[];
    price: number;
  };
  other_user?: {
    name: string;
    phone: string;
  };
}

const Chat = () => {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeChat();
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const initializeChat = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setCurrentUserId(session.user.id);

      // Fetch chat info
      const { data: chat, error: chatError } = await supabase
        .from("chats")
        .select(`
          id,
          pet_id,
          buyer_id,
          seller_id,
          pets:pet_id (name, images, price)
        `)
        .eq("id", chatId)
        .single();

      if (chatError) throw chatError;

      // Determine the other user
      const otherUserId = chat.buyer_id === session.user.id ? chat.seller_id : chat.buyer_id;
      
      const { data: otherUser } = await supabase
        .from("profiles")
        .select("name, phone")
        .eq("id", otherUserId)
        .single();

      setChatInfo({
        ...chat,
        pet: chat.pets as any,
        other_user: otherUser
      });

      // Fetch messages
      await fetchMessages();

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("chat_id", chatId)
        .neq("sender_id", session.user.id);

      // Subscribe to new messages
      const channel = supabase
        .channel(`chat:${chatId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `chat_id=eq.${chatId}`
          },
          (payload) => {
            const newMsg = payload.new as Message;
            setMessages(prev => [...prev, newMsg]);
            
            // Mark as read if not from current user
            if (newMsg.sender_id !== session.user.id) {
              supabase
                .from("messages")
                .update({ is_read: true })
                .eq("id", newMsg.id);
            }
          }
        )
        .subscribe();

      setLoading(false);

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error: any) {
      toast.error("Failed to load chat");
      navigate(-1);
    }
  };

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        sender_id: currentUserId,
        content: messageContent
      });

      if (error) throw error;

      // Update last message in chat
      await supabase
        .from("chats")
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString()
        })
        .eq("id", chatId);

    } catch (error: any) {
      toast.error("Failed to send message");
      setNewMessage(messageContent);
    }
  };

  const handleTyping = () => {
    // Simulate typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    // In a real app, you'd broadcast typing status via realtime
  };

  const maskPhoneNumber = (phone: string | null | undefined): string => {
    if (!phone) return "Hidden for privacy";
    if (phone.length < 6) return "Hidden";
    return `${phone.slice(0, 3)}****${phone.slice(-3)}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { date: string; messages: Message[] }[] = [];
    let currentDate = "";

    messages.forEach(message => {
      const messageDate = formatDate(message.created_at);
      if (messageDate !== currentDate) {
        currentDate = messageDate;
        groups.push({ date: messageDate, messages: [message] });
      } else {
        groups[groups.length - 1].messages.push(message);
      }
    });

    return groups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-muted rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {chatInfo?.pet?.images?.[0] && (
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0">
              <img 
                src={chatInfo.pet.images[0]} 
                alt={chatInfo.pet.name} 
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{chatInfo?.other_user?.name || "User"}</h1>
            <p className="text-xs text-muted-foreground truncate">
              {chatInfo?.pet?.name} • ₹{chatInfo?.pet?.price?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <Phone className="w-5 h-5 text-muted-foreground" />
          </button>
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <MoreVertical className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Phone Number Notice */}
      <div className="bg-secondary/50 px-4 py-2 text-center">
        <p className="text-xs text-muted-foreground">
          📞 Seller's phone: <span className="font-mono">{maskPhoneNumber(chatInfo?.other_user?.phone)}</span>
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {groupMessagesByDate(messages).map((group, groupIndex) => (
          <div key={groupIndex}>
            <div className="flex justify-center my-4">
              <span className="px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground">
                {group.date}
              </span>
            </div>
            {group.messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              return (
                <div
                  key={message.id}
                  className={`flex mb-3 ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-card border border-border rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}>
                      <span className="text-[10px]">{formatTime(message.created_at)}</span>
                      {isOwn && (
                        message.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-card border-t border-border p-4 safe-area-inset-bottom">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <button
            type="button"
            className="p-2 hover:bg-muted rounded-xl transition-colors"
          >
            <Image className="w-5 h-5 text-muted-foreground" />
          </button>
          <div className="flex-1 relative">
            <Input
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Type a message..."
              className="h-11 rounded-full bg-muted border-0 pr-4"
            />
          </div>
          <Button
            type="submit"
            disabled={!newMessage.trim()}
            size="icon"
            className="h-11 w-11 rounded-full bg-gradient-primary hover:opacity-90"
          >
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
