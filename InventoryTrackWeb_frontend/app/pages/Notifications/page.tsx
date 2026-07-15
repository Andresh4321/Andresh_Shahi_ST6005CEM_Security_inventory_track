"use client";

import { useEffect, useState } from 'react';
import { Bell, MessageCircle, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '../../hooks/use-toast';
import { messagingApi } from '@/lib/api/messaging';

interface Notification {
  _id: string;
  senderName: string;
  senderEmail: string;
  conversationId: string;
  lastMessage: string;
  createdAt: string;
  messageCount: number;
}

const Notifications = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingRead, setMarkingRead] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await messagingApi.getNotifications();
      setNotifications(response.data?.data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load notifications',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToMessage = async (notification: Notification) => {
    try {
      setMarkingRead(notification.conversationId);
      // Mark as read by fetching the conversation
      await messagingApi.getConversation(notification.conversationId);
      router.push(`/Messaging`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to open message',
        variant: 'destructive',
      });
    } finally {
      setMarkingRead(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <DashboardLayout title="Notifications" subtitle="Messages from your team">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground font-display font-bold">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Message Notifications</h2>
            <p className="text-sm text-muted-foreground">
              {notifications.length === 0
                ? 'No new messages'
                : `${notifications.length} new message${notifications.length !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>

        {loading ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6">
              <MessageCircle className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="font-display text-lg font-semibold mb-2">No new messages</h3>
            <p className="text-muted-foreground text-sm max-w-xs text-center mb-6">
              You're all caught up! No unread messages at the moment.
            </p>
            <Button variant="outline" onClick={() => router.push('/Messaging')}>
              Go to Messages
            </Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <Card
                key={notification.conversationId}
                className="p-5 hover:shadow-md transition-all duration-200 opacity-0 animate-scale-in border-l-4 border-l-primary"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-display font-bold shrink-0">
                          {notification.senderName.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm truncate">{notification.senderName}</h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {notification.senderEmail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(notification.createdAt)}
                        </p>
                        {notification.messageCount > 1 && (
                          <span className="inline-block mt-1 text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                            +{notification.messageCount - 1}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {notification.lastMessage}
                    </p>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">Unread message</span>
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    size="sm"
                    onClick={() => handleGoToMessage(notification)}
                    disabled={markingRead === notification.conversationId}
                    className="shrink-0"
                  >
                    {markingRead === notification.conversationId ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="h-4 w-4 mr-2" />
                        View
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
