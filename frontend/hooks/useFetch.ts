"use client";

import useSWR, { SWRConfiguration } from "swr";
import { apiFetch, ApiError } from "@/lib/api";

export function useFetch<T>(path: string | null, config?: SWRConfiguration) {
  return useSWR<T, ApiError>(path, (url: string) => apiFetch<T>(url), {
    revalidateOnFocus: false,
    ...config,
  });
}
