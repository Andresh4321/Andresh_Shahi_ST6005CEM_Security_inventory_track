import { redirect } from "next/navigation";

interface MessagingConversationPageProps {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ email?: string }>;
}

export default async function MessagingConversationPage({
  params,
  searchParams,
}: MessagingConversationPageProps) {
  const { conversationId } = await params;
  const { email } = await searchParams;

  const query = new URLSearchParams();
  query.set("conversationId", conversationId);

  if (email) {
    query.set("email", email);
  }

  redirect(`/Messaging?${query.toString()}`);
}
