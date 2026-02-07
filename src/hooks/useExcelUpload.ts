import { useState, useCallback } from "react";
import { parseExcelFile, getSheetNames } from "../utils/excelParser";
import type { ValidationError } from "../types";

interface UseExcelUploadState {
  file: File | null;
  sheetNames: string[];
  sheetsData: Record<string, unknown[]>;
  loading: boolean;
  error: string | null;
  validationErrors: ValidationError[];
}

/**
 * Hook for Excel file upload, parsing, and validation.
 */
export function useExcelUpload() {
  const [state, setState] = useState<UseExcelUploadState>({
    file: null,
    sheetNames: [],
    sheetsData: {},
    loading: false,
    error: null,
    validationErrors: [],
  });

  const handleFileUpload = useCallback(async (file: File) => {
    setState((prev) => ({ ...prev, file, loading: true, error: null }));

    try {
      const [names, data] = await Promise.all([
        getSheetNames(file),
        parseExcelFile(file),
      ]);

      setState((prev) => ({
        ...prev,
        sheetNames: names,
        sheetsData: data,
        loading: false,
      }));

      return { sheetNames: names, sheetsData: data };
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to parse Excel file";
      setState((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
      throw err;
    }
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[]) => {
    setState((prev) => ({ ...prev, validationErrors: errors }));
  }, []);

  const reset = useCallback(() => {
    setState({
      file: null,
      sheetNames: [],
      sheetsData: {},
      loading: false,
      error: null,
      validationErrors: [],
    });
  }, []);

  return {
    ...state,
    handleFileUpload,
    setValidationErrors,
    reset,
  };
}
