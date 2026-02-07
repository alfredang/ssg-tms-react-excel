import { useState, useCallback } from "react";
import type { AxiosResponse } from "axios";

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Generic hook for managing API call state (loading, data, error).
 */
export function useApi<T = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (apiCall: () => Promise<AxiosResponse<T>>) => {
      setState({ data: null, loading: true, error: null });
      try {
        const response = await apiCall();
        setState({ data: response.data, loading: false, error: null });
        return response.data;
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setState({ data: null, loading: false, error: message });
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}
