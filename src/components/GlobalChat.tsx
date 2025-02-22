
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCrown, faShieldHalved, faCoins } from '@fortawesome/free-solid-svg-icons';
import { useToast } from '@/hooks/use-toast';
import { formatNumber } from '@/utils/formatNumber';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  is_tip: boolean;
  tip_amount: number;
  profiles: {
    username: string;
    is_admin: boolean;
    is_owner: boolean;
  };
}

interface BannedUser {
  user_id: string;
  reason: string;
}

export const GlobalChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [tipAmount, setTipAmount] = useState('');
  const [tipMode, setTipMode] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isBanned, setIsBanned] = useState<BannedUser | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkBanStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: banData } = await supabase
        .from('banned_users')
        .select('user_id, reason')
        .eq('user_id', user.id)
        .maybeSingle();

      if (banData) {
        setIsBanned(banData);
      }
    };

    checkBanStatus();
  }, []);

  useEffect(() => {
    // Fetch initial messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          profiles:user_id (
            username,
            is_admin,
            is_owner
          )
        `)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data as ChatMessage[]);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        async (payload) => {
          // Fetch the complete message with user profile
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              profiles:user_id (
                username,
                is_admin,
                is_owner
              )
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages(prev => [...prev, data as ChatMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const sendMessage = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to send messages",
        variant: "destructive",
      });
      return;
    }

    if (isBanned) {
      toast({
        title: "Error",
        description: `You have been permanently banned. Reason: ${isBanned.reason}`,
        variant: "destructive",
      });
      return;
    }

    if (!newMessage.trim()) return;

    const messageData: any = {
      user_id: user.id,
      content: newMessage.trim(),
    };

    if (tipMode && selectedUserId && tipAmount) {
      const amount = parseInt(tipAmount.replace(/[^0-9]/g, ''));
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Error",
          description: "Invalid tip amount",
          variant: "destructive",
        });
        return;
      }

      // Check user's balance
      const { data: walletData } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (!walletData || walletData.balance < amount) {
        toast({
          title: "Error",
          description: "Insufficient balance",
          variant: "destructive",
        });
        return;
      }

      messageData.is_tip = true;
      messageData.tip_amount = amount;
      messageData.tip_recipient_id = selectedUserId;

      // Update balances
      const { error: updateError } = await supabase.rpc('transfer_money', {
        amount: amount,
        recipient_id: selectedUserId
      });

      if (updateError) {
        toast({
          title: "Error",
          description: "Failed to send tip",
          variant: "destructive",
        });
        return;
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert(messageData);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return;
    }

    setNewMessage('');
    setTipMode(false);
    setTipAmount('');
    setSelectedUserId(null);
  };

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {isVisible ? (
        <div className="bg-gray-800 rounded-lg w-80 h-96 flex flex-col shadow-lg">
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-white font-bold">Global Chat</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-white"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {messages.map((message) => (
              <div key={message.id} className="break-words">
                <span className="font-medium text-white">
                  {message.profiles.is_owner && (
                    <FontAwesomeIcon icon={faCrown} className="text-yellow-500 mr-1" />
                  )}
                  {message.profiles.is_admin && (
                    <FontAwesomeIcon icon={faShieldHalved} className="text-blue-500 mr-1" />
                  )}
                  <button 
                    onClick={() => {
                      setTipMode(true);
                      setSelectedUserId(message.user_id);
                    }}
                    className="hover:text-yellow-500"
                  >
                    {message.profiles.username}
                  </button>
                </span>
                {message.is_tip && (
                  <span className="text-yellow-500 ml-2">
                    <FontAwesomeIcon icon={faCoins} /> {formatNumber(message.tip_amount)}
                  </span>
                )}
                <span className="text-gray-300 ml-2">{message.content}</span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {isBanned ? (
            <div className="p-3 border-t border-gray-700">
              <div className="text-red-500 text-center">
                You have been permanently banned.
                <br />
                Reason: {isBanned.reason}
              </div>
            </div>
          ) : (
            <div className="p-3 border-t border-gray-700">
              {tipMode ? (
                <div className="mb-2 flex items-center space-x-2">
                  <input
                    type="text"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(e.target.value)}
                    placeholder="Tip amount"
                    className="bg-gray-700 text-white px-2 py-1 rounded flex-1"
                  />
                  <button
                    onClick={() => {
                      setTipMode(false);
                      setTipAmount('');
                      setSelectedUserId(null);
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                </div>
              ) : null}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="bg-gray-700 text-white px-3 py-2 rounded flex-1"
                />
                <button
                  onClick={sendMessage}
                  className="bg-yellow-500 text-gray-900 px-4 py-2 rounded hover:bg-yellow-400"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsVisible(true)}
          className="bg-yellow-500 text-gray-900 p-3 rounded-full hover:bg-yellow-400 shadow-lg"
        >
          <FontAwesomeIcon icon={faTimes} className="transform rotate-45" />
        </button>
      )}
    </div>
  );
};
