"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { User } from "@/types";

type SessionState = { user: User | null; loading: boolean; error: Error | null };

export function useSession() {
  const [state, setState] = useState<SessionState>({ user: null, loading: true, error: null });

  useEffect(() => {
    let active = true;
    apiFetch<User>("/auth/me")
      .then((user) => { if (active) setState({ user, loading: false, error: null }); })
      .catch((error: Error) => { if (active) setState({ user: null, loading: false, error }); });
    return () => { active = false; };
  }, []);

  return state;
}
