"use client";

import { useEffect, useState } from "react";
import type { Notification } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<Event | null>(null);

  useEffect(() => {
    const source = new EventSource(API_URL + "/notifications/stream", { withCredentials: true });
    source.onopen = () => { setConnected(true); setError(null); };
    source.onmessage = (event) => {
      const notification = JSON.parse(event.data) as Notification;
      setNotifications((current) => [notification, ...current]);
    };
    source.onerror = (event) => { setConnected(false); setError(event); };
    return () => source.close();
  }, []);

  return { notifications, connected, error };
}
