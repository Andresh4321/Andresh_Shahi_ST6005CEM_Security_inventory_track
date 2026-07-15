"use client";

import { useEffect, useState } from 'react';
import { MessageCircle, Send, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { messagingApi } from '@/lib/api/messaging';
import { useAuth } from '@/app/context/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter, useSearchParams } from 'next/navigation';

interface Conversation {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
}

interface Message {
  _id: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: string;
  isMine?: boolean;
}

const normalizeId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (typeof value.$oid === 'string') return value.$oid;
    if (typeof value._id === 'string') return value._id;
    if (typeof value.id === 'string') return value.id;
  }
  return String(value);
};

const Messaging = () => {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [contactEmail, setContactEmail] = useState('');
  const [checkingUser, setCheckingUser] = useState(false);
  const [userNotFound, setUserNotFound] = useState(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const conversationIdFromQuery = searchParams.get('conversationId');
  const emailFromQuery = searchParams.get('email') || '';
  const receiverIdFromQuery = searchParams.get('receiverId') || '';
  const receiverNameFromQuery = searchParams.get('receiverName') || '';

  // Debug: Log user and auth state
  useEffect(() => {
    console.log('Current authenticated user:', user);
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [user?.id || user?._id]); // Refetch conversations when user changes

  // Auto-poll messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation || !selectedConversation.conversationId) {
      if (pollingInterval) clearInterval(pollingInterval);
      setPollingInterval(null);
      return;
    }

    const pollMessages = async () => {
      try {
        const response = await messagingApi.getConversation(selectedConversation.conversationId);
        setMessages(response.data?.data || []);
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    };

    // Initial fetch
    pollMessages();

    // Set up polling interval (every 2 seconds)
    const interval = setInterval(pollMessages, 2000);
    setPollingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
      setPollingInterval(null);
    };
  }, [selectedConversation?.conversationId]);

  useEffect(() => {
    const openConversationFromQuery = async () => {
      if (!conversationIdFromQuery || loading) return;

      const existingConversation = conversations.find(
        (conv) => conv.conversationId === conversationIdFromQuery
      );

      if (existingConversation) {
        if (
          selectedConversation?.conversationId !== existingConversation.conversationId
        ) {
          await handleSelectConversation(existingConversation);
        }
        return;
      }

      const fallbackConversation: Conversation = {
        conversationId: conversationIdFromQuery,
        otherUserId: receiverIdFromQuery,
        otherUserName: receiverNameFromQuery || (emailFromQuery ? emailFromQuery.split('@')[0] : 'User'),
        otherUserEmail: emailFromQuery,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unread: false,
      };

      setSelectedConversation(fallbackConversation);
      const response = await messagingApi.getConversation(conversationIdFromQuery);
      setMessages(response.data?.data || []);
    };

    openConversationFromQuery();
  }, [
    conversationIdFromQuery,
    emailFromQuery,
    receiverIdFromQuery,
    receiverNameFromQuery,
    loading,
    conversations,
    selectedConversation?.conversationId,
  ]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await messagingApi.getConversationsList();
      const convs = response.data?.data || [];
      setConversations(convs);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load conversations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversation: Conversation) => {
    try {
      setSelectedConversation(conversation);
      const response = await messagingApi.getConversation(conversation.conversationId);
      const fetchedMessages = response.data?.data || [];
      console.log(`Loaded ${fetchedMessages.length} messages for conversation`, conversation.conversationId);
      setMessages(fetchedMessages);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    }
  };

  const handleNewConversation = async () => {
    if (!contactEmail) {
      toast({
        title: 'Error',
        description: 'Please enter an email',
        variant: 'destructive',
      });
      return;
    }

    try {
      setCheckingUser(true);
      setUserNotFound(false);
      const response = await messagingApi.checkUserExists(contactEmail);

      if (!response.data?.success) {
        setUserNotFound(true);
        toast({
          title: 'User Not Found',
          description: `${contactEmail} is not registered in the app`,
          variant: 'destructive',
        });
        return;
      }

      // Get or create conversation
      const convResponse = await messagingApi.getOrCreateConversation(contactEmail);
      const createdConversationId = convResponse.data?.data?.conversationId;
      const createdReceiverId = convResponse.data?.data?.receiverId;
      const createdReceiverName = convResponse.data?.data?.receiverName;
      const createdReceiverEmail = convResponse.data?.data?.receiverEmail;

      if (!createdConversationId) {
        throw new Error('Conversation ID not received from server');
      }

      setIsOpenDialog(false);
      setContactEmail('');

      router.push(
        `/Messaging?conversationId=${createdConversationId}&email=${encodeURIComponent(createdReceiverEmail || contactEmail)}&receiverId=${createdReceiverId || ''}&receiverName=${encodeURIComponent(createdReceiverName || '')}`
      );
    } catch (error: any) {
      setUserNotFound(true);
      toast({
        title: 'Error',
        description: error.message || 'User not found',
        variant: 'destructive',
      });
    } finally {
      setCheckingUser(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSendingMessage(true);
      await messagingApi.sendMessage({
        receiverId: selectedConversation.otherUserId,
        conversationId: selectedConversation.conversationId,
        message: newMessage,
      });

      setNewMessage('');
      await handleSelectConversation(selectedConversation);
      toast({
        title: 'Success',
        description: 'Message sent',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <DashboardLayout title="Messages" subtitle="Chat with your suppliers and team">
      <div className="flex h-screen bg-background">
        {/* Conversations List */}
        <div className={`w-full md:w-96 border-r border-border flex flex-col ${selectedConversation ? 'hidden md:flex' : ''}`}>
          {/* Header */}
          <div className="p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-xl">Messages</h1>
                  <p className="text-xs text-muted-foreground">Stay connected</p>
                </div>
              </div>
            </div>

            <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
              <DialogTrigger asChild>
                <Button variant="gradient" className="w-full">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-display text-xl">💬 Start New Conversation</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20 text-primary text-xs font-bold">1</span>
                      Recipient Email
                    </label>
                    <Input
                      type="email"
                      placeholder="supplier@example.com"
                      value={contactEmail}
                      onChange={(e) => {
                        setContactEmail(e.target.value);
                        setUserNotFound(false);
                      }}
                      className="h-10"
                    />
                    {userNotFound && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
                        <p className="text-xs text-destructive">{contactEmail} is not registered in the app</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setIsOpenDialog(false);
                        setContactEmail('');
                        setUserNotFound(false);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      className="flex-1"
                      onClick={handleNewConversation}
                      disabled={checkingUser}
                    >
                      {checkingUser ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Start Chat'
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground text-sm">Loading conversations...</p>
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-6 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                  <MessageCircle className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground mt-2">Start a new conversation to begin messaging</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  onClick={() => handleSelectConversation(conversation)}
                  className={`w-full p-4 border-b border-border hover:bg-muted/50 transition-colors text-left ${
                    selectedConversation?.conversationId === conversation.conversationId
                      ? 'bg-muted border-l-2 border-l-primary'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-sm truncate">{conversation.otherUserName}</h3>
                    <p className="text-xs text-muted-foreground">{formatTime(conversation.lastMessageTime)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conversation.lastMessage}</p>
                  {conversation.unread && (
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary"></div>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedConversation && (
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="p-6 border-b border-border bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-display font-bold">
                  {selectedConversation.otherUserName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display font-semibold">{selectedConversation.otherUserName}</h2>
                  <p className="text-xs text-muted-foreground">{selectedConversation.otherUserEmail}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-background">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const currentUserId = normalizeId(user?._id || user?.id);
                  const senderId = normalizeId(msg.senderId);
                  const isCurrentUser = typeof msg.isMine === 'boolean'
                    ? msg.isMine
                    : senderId === currentUserId;
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${isCurrentUser ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg border ${
                          isCurrentUser
                            ? 'bg-blue-100 border-blue-200 text-blue-900 rounded-bl-none'
                            : 'bg-emerald-100 border-emerald-200 text-emerald-900 rounded-br-none'
                        }`}
                      >
                        <p className={`text-[11px] font-semibold mb-1 ${isCurrentUser ? 'text-blue-700' : 'text-emerald-700'}`}>
                          {isCurrentUser ? 'You' : (msg.senderName || selectedConversation.otherUserName)}
                        </p>
                        <p className="text-sm overflow-hidden">{msg.message}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-700/80' : 'text-emerald-700/80'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input */}
            <div className="p-6 border-t border-border bg-card">
              <div className="flex gap-3">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="flex-1 h-10"
                />
                <Button
                  variant="gradient"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="h-10 w-10"
                >
                  {sendingMessage ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!selectedConversation && (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">No conversation selected</h3>
              <p className="text-muted-foreground max-w-xs">
                Select a conversation from the list or start a new one to begin messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messaging;
