"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Loader2, User, Bot } from "lucide-react";
import { DashboardLayout } from "../dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supplierApi } from "@/lib/api/suppliers";
import { useToast } from "../../hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Supplier {
  id: string;
  _id?: string;
  name: string;
  email: string;
  contactNumber?: string;
  contact_number?: string;
  products: string[];
}

const AIAssistant = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI assistant. I can help you find suppliers for your products. Try asking me something like 'Who are the suppliers who supply...?'",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const predefinedQuestions = [
    "Who are the suppliers who supply...",
    "Show me suppliers for...",
    "Find suppliers that provide...",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePredefinedQuestion = (question: string) => {
    setInput(question);
  };

  const extractProducts = (userMessage: string): string[] => {
    // Remove the predefined question part and extract product names
    const patterns = [
      /who are the suppliers who supply\s*(.*?)(\?|$)/i,
      /show me suppliers for\s*(.*?)(\?|$)/i,
      /find suppliers that provide\s*(.*?)(\?|$)/i,
      /suppliers who supply\s*(.*?)(\?|$)/i,
      /suppliers for\s*(.*?)(\?|$)/i,
    ];

    for (const pattern of patterns) {
      const match = userMessage.match(pattern);
      if (match && match[1]) {
        // Split by common delimiters: comma, 'and', 'or'
        let productsStr = match[1].trim();
        
        // Remove leading/trailing punctuation like "...", periods, etc.
        productsStr = productsStr.replace(/^[\.\s]+|[\.\s]+$/g, '');
        
        return productsStr
          .split(/,\s*|\s+and\s+|\s+or\s+/i)
          .map((p) => p.trim().toLowerCase())
          .map((p) => p.replace(/^[\.\s]+|[\.\s]+$/g, '')) // Clean each product
          .filter((p) => p.length > 0);
      }
    }

    return [];
  };

  const findSuppliersByProducts = async (products: string[]): Promise<Supplier[]> => {
    try {
      // For each product, fetch suppliers that have it
      const allSuppliersMap = new Map<string, Supplier>();
      
      for (const product of products) {
        try {
          const response = await supplierApi.getByProduct(product);
          const suppliers = response.data?.data || [];
          
          // Add to map to avoid duplicates
          if (Array.isArray(suppliers)) {
            suppliers.forEach((rawSupplier: Supplier) => {
              const normalizedSupplier: Supplier = {
                ...rawSupplier,
                id: rawSupplier.id || rawSupplier._id || rawSupplier.email,
                contactNumber: rawSupplier.contactNumber || rawSupplier.contact_number || "N/A",
                products: Array.isArray(rawSupplier.products) ? rawSupplier.products : [],
              };

              allSuppliersMap.set(normalizedSupplier.id, normalizedSupplier);
            });
          }
        } catch (error) {
          console.error(`Error fetching suppliers for ${product}:`, error);
        }
      }

      return Array.from(allSuppliersMap.values());
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  };

  const formatSupplierResponse = (suppliers: Supplier[], products: string[]): string => {
    if (suppliers.length === 0) {
      return `I couldn't find any suppliers for ${products.join(", ")}. You may need to add new suppliers to your system.`;
    }

    let response = `I found ${suppliers.length} supplier${suppliers.length > 1 ? "s" : ""} for ${products.join(", ")}:\n\n`;

    suppliers.forEach((supplier, index) => {
      response += `**${index + 1}. ${supplier.name}**\n`;
      response += `📧 Email: ${supplier.email}\n`;
      response += `📞 Contact: ${supplier.contactNumber}\n`;
      response += `📦 Products: ${supplier.products.join(", ")}\n\n`;
    });

    return response;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Extract products from user message
      const products = extractProducts(input);

      if (products.length === 0) {
        // If no products found, provide guidance
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Please specify which products or materials you're looking for. For example: 'Who are the suppliers who supply eggs?' or 'Show me suppliers for milk and butter'",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // Find suppliers
        const suppliers = await findSuppliersByProducts(products);
        const responseContent = formatSupplierResponse(suppliers, products);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: responseContent,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search suppliers. Please try again.",
        variant: "destructive",
      });
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error while searching for suppliers. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <DashboardLayout title="AI Assistant" subtitle="Ask me about suppliers and products">
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="border-b bg-card p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500" />
            <h1 className="text-2xl font-bold">AI Assistant</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ask me about suppliers and products
          </p>
        </div>

        {/* Predefined Questions */}
        {messages.length <= 1 && (
          <div className="p-4 border-b bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
            <div className="flex flex-wrap gap-2">
              {predefinedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handlePredefinedQuestion(question)}
                  className="text-sm"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              <Card
                className={`max-w-[70%] p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <div className="text-sm whitespace-pre-wrap wrap-break-word">
                  {message.content}
                </div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Card>
              {message.role === "user" && (
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Card className="max-w-[70%] p-3 bg-muted">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-card p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about suppliers..."
              className="flex-1"
              disabled={loading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              size="icon"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistant;
