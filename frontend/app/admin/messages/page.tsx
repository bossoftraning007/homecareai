"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      const { data } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      setMessages(data || []);
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    await supabase
      .from("contact_messages")
      .update({ is_read: true })
      .eq("id", id);
    loadMessages();
  };

  const deleteMessage = async (id: string) => {
    await supabase.from("contact_messages").delete().eq("id", id);
    loadMessages();
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-black ${isDark ? "text-white" : "text-gray-900"}`}>
              Contact Messages
            </h1>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>
              {messages.length} message{messages.length !== 1 ? "s" : ""} total
            </p>
          </div>
          <div className={`px-4 py-2 rounded-full ${isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700"}`}>
            {messages.filter((m) => !m.is_read).length} unread
          </div>
        </div>

        {messages.length === 0 ? (
          <div className={`text-center py-16 rounded-3xl ${isDark ? "bg-gray-800" : "bg-white"} shadow-xl`}>
            <div className="text-5xl mb-4">📭</div>
            <p className={isDark ? "text-gray-400" : "text-gray-600"}>No messages yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-6 rounded-2xl border transition-all ${
                  msg.is_read
                    ? isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
                    : isDark ? "bg-emerald-900/20 border-emerald-800" : "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                        {msg.name}
                      </span>
                      {!msg.is_read && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500 text-white">
                          New
                        </span>
                      )}
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-emerald-500 hover:underline block mb-3"
                    >
                      {msg.email}
                    </a>
                    <p className={`text-sm ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                      {msg.message}
                    </p>
                    <p className={`text-xs mt-3 ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!msg.is_read && (
                      <button
                        onClick={() => markAsRead(msg.id)}
                        className={`px-3 py-1.5 text-xs rounded-lg ${isDark ? "bg-gray-700 text-gray-300 hover:bg-gray-600" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(msg.id)}
                      className="px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
