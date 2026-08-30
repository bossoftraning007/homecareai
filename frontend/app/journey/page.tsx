"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/useAuth";

interface TimelineEvent {
  id: string;
  event_type: string;
  title: string;
  description?: string;
  icon: string;
  metadata?: Record<string, unknown>;
  event_date: string;
}

interface WeeklyStory {
  story: string;
  highlights: string[];
  total_events: number;
  days_active: number;
}

const EVENT_COLORS: Record<string, string> = {
  chat: "from-blue-500 to-blue-600",
  medication: "from-green-500 to-green-600",
  wellness: "from-purple-500 to-purple-600",
  recovery: "from-orange-500 to-orange-600",
  symptom: "from-red-500 to-red-600",
  achievement: "from-yellow-500 to-yellow-600",
};

const EVENT_LABELS: Record<string, string> = {
  chat: "AI Chat",
  medication: "Medication",
  wellness: "Wellness",
  recovery: "Recovery",
  symptom: "Symptom",
  achievement: "Achievement",
};

export default function HealthJourney() {
  const { user } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [weeklyStory, setWeeklyStory] = useState<WeeklyStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchTimeline();
      fetchInsights();
      fetchWeeklyStory();
    }
  }, [user]);

  const fetchTimeline = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeline`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      });
      const data = await res.json();
      setEvents(data.events || []);
    } catch (err) {
      console.error("Failed to fetch timeline:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeline/insights`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      });
      const data = await res.json();
      setInsights(data.insights || []);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    }
  };

  const fetchWeeklyStory = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/timeline/weekly-story`, {
        headers: {
          Authorization: `Bearer ${user?.access_token}`,
        },
      });
      const data = await res.json();
      setWeeklyStory(data);
    } catch (err) {
      console.error("Failed to fetch weekly story:", err);
    }
  };

  const filteredEvents = filter === "all"
    ? events
    : events.filter((e) => e.event_type === filter);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupByDate = (events: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    events.forEach((event) => {
      const date = event.event_date.slice(0, 10);
      if (!groups[date]) groups[date] = [];
      groups[date].push(event);
    });
    return groups;
  };

  const grouped = groupByDate(filteredEvents);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🌿 My Health Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your complete health story in one place
          </p>
        </div>

        {/* Insights Card */}
        {insights.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6 border border-green-100 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
              <span>🧠</span> AI Insights
            </h2>
            <div className="space-y-2">
              {insights.map((insight, i) => (
                <div
                  key={i}
                  className="bg-green-50 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-200"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weekly Story Card */}
        {weeklyStory && weeklyStory.total_events > 0 && (
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 mb-6 text-white">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <span>📖</span> This Week in Your Health
            </h2>
            <div className="bg-white/20 rounded-xl p-4 mb-3">
              <p className="text-sm whitespace-pre-line">{weeklyStory.story}</p>
            </div>
            {weeklyStory.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {weeklyStory.highlights.map((h, i) => (
                  <span key={i} className="bg-white/20 px-3 py-1 rounded-full text-xs">
                    {h}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 text-sm text-white/80">
              {weeklyStory.total_events} events • {weeklyStory.days_active} days active
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 justify-center">
          {["all", "chat", "medication", "wellness", "recovery", "symptom", "achievement"].map(
            (type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === type
                    ? "bg-green-600 text-white shadow-md"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700"
                }`}
              >
                {type === "all" ? "📋 All" : `${EVENT_LABELS[type] || type}`}
              </button>
            )
          )}
        </div>

        {/* Timeline */}
        {Object.keys(grouped).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your journey is just beginning
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Start chatting with AI, logging wellness, or adding medications to see your timeline grow.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, dayEvents]) => (
                <div key={date}>
                  {/* Date Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>

                  {/* Events */}
                  <div className="space-y-3 ml-4 border-l-2 border-green-200 dark:border-green-800 pl-6">
                    {dayEvents.map((event) => (
                      <div
                        key={event.id}
                        className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
                      >
                        {/* Timeline dot */}
                        <div
                          className={`absolute -left-[31px] top-4 w-4 h-4 rounded-full bg-gradient-to-r ${
                            EVENT_COLORS[event.event_type] || "from-gray-400 to-gray-500"
                          } border-2 border-white dark:border-gray-900`}
                        ></div>

                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{event.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${
                                  EVENT_COLORS[event.event_type]
                                } text-white font-medium`}
                              >
                                {EVENT_LABELS[event.event_type] || event.event_type}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(event.event_date).split(",").pop()?.trim()}
                              </span>
                            </div>
                            <h3 className="font-medium text-gray-800 dark:text-white">
                              {event.title}
                            </h3>
                            {event.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {event.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
